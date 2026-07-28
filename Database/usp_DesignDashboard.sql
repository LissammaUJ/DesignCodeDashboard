-- =============================================================================
-- Design Dashboard — Single Deployment Script
-- Database : CarolERP
-- Purpose  : Create dbo.IntIdList (if needed) and dbo.usp_DesignDashboard.
-- Usage    : Open in SSMS, ensure connection targets CarolERP, Execute (F5).
-- Safe     : IF NOT EXISTS / CREATE OR ALTER — may be re-run.
-- =============================================================================

USE CarolERP;
GO

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

-- =============================================================================
-- PREREQUISITE: Table-valued type dbo.IntIdList
-- Used by: GetDesignThumbnails (@DesignIds TVP)
-- =============================================================================

IF TYPE_ID(N'dbo.IntIdList') IS NULL
BEGIN
    CREATE TYPE dbo.IntIdList AS TABLE
    (
        Id INT NOT NULL PRIMARY KEY
    );
END
GO

-- =============================================================================
-- dbo.usp_DesignDashboard — unified action dispatcher
-- =============================================================================

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_DesignDashboard
    @Action      NVARCHAR(50),
    @AccountId   INT = NULL,
    @DesignId    INT = NULL,
    @StartDate   DATETIME = NULL,
    @EndDate     DATETIME = NULL,
    @DesignIds   dbo.IntIdList READONLY
AS
BEGIN
    SET NOCOUNT ON;

    IF (@Action IS NULL OR LTRIM(RTRIM(@Action)) = N'')
    BEGIN
        RAISERROR('Action is required.', 16, 1);
        RETURN;
    END;

    ---------------------------------------------------------------------------
    -- GetActiveCustomers
    -- Customer dropdown — MasType 65/95 with bills in date range
    ---------------------------------------------------------------------------
    IF (@Action = N'GetActiveCustomers')
    BEGIN
        IF (@StartDate IS NULL OR @EndDate IS NULL OR @EndDate < @StartDate)
        BEGIN
            RAISERROR('StartDate and EndDate are required, and EndDate must be >= StartDate.', 16, 1);
            RETURN;
        END;

        SELECT DISTINCT
              CAST(a.AccountId AS INT) AS AccountId,
              a.AccountName
        FROM Account a
        INNER JOIN Masters m
                ON a.MasId = m.MasId
        WHERE a.Active = 1
          AND m.MasType IN (65, 95)
          AND EXISTS
          (
              SELECT 1
              FROM Bill_mas bm
              WHERE bm.AccountId = a.AccountId
                AND bm.BillDate BETWEEN @StartDate AND @EndDate
          )
        ORDER BY
              a.AccountName;
    END

    ---------------------------------------------------------------------------
    -- GetCustomerSales
    -- Design cards — sales by AccountId + date range (ProductName via OUTER APPLY)
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetCustomerSales')
    BEGIN
        IF (@AccountId IS NULL OR @AccountId <= 0)
        BEGIN
            RAISERROR('AccountId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        IF (@StartDate IS NULL OR @EndDate IS NULL OR @EndDate < @StartDate)
        BEGIN
            RAISERROR('StartDate and EndDate are required, and EndDate must be >= StartDate.', 16, 1);
            RETURN;
        END;

        SELECT
              d.DesignId,
              ISNULL(d.DesignCode, N'') AS DesignCode,
              ISNULL(d.DesignName, N'') AS DesignName,
              ISNULL(NULLIF(LTRIM(RTRIM(prod.ProductName)), N''), N'-') AS ProductName,
              CAST(ISNULL(SUM(bet.Quantity), 0) AS DECIMAL(18, 2)) AS TotalSalesQty,
              CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18, 2)) AS TotalSalesAmount,
              CAST(0 AS DECIMAL(18, 2)) AS PendingOrder,
              CAST(0 AS DECIMAL(18, 2)) AS PendingProcess
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
               ON bm.BillId = bet.BillId
        INNER JOIN Bo_trn bo
               ON bet.BoSl = bo.BoSl
        INNER JOIN Product p
               ON bo.ProductId = p.ProductId
        INNER JOIN ItemDesign d
               ON p.DesignId = d.DesignId
        OUTER APPLY
        (
            SELECT TOP (1)
                  px.ProductName
            FROM Product px
            WHERE px.DesignId = d.DesignId
            ORDER BY
                  CASE WHEN px.Active = 1 THEN 0 ELSE 1 END,
                  px.ProductName
        ) prod
        WHERE bm.AccountId = @AccountId
          AND bm.BillDate BETWEEN @StartDate AND @EndDate
        GROUP BY
              d.DesignId,
              d.DesignCode,
              d.DesignName,
              prod.ProductName
        ORDER BY
              d.DesignCode;
    END

    ---------------------------------------------------------------------------
    -- GetSummary
    -- Dashboard KPI summary — one row per Design (aggregated in C#)
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetSummary')
    BEGIN
        IF (@AccountId IS NULL OR @AccountId <= 0)
        BEGIN
            RAISERROR('AccountId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        IF (@StartDate IS NULL OR @EndDate IS NULL OR @EndDate < @StartDate)
        BEGIN
            RAISERROR('StartDate and EndDate are required, and EndDate must be >= StartDate.', 16, 1);
            RETURN;
        END;

        ;WITH DesignSales AS (
            SELECT
                  d.DesignId,
                  ISNULL(d.DesignCode, N'') AS DesignCode,
                  ISNULL(d.DesignName, N'') AS DesignName,
                  CAST(ISNULL(SUM(bet.Quantity), 0) AS DECIMAL(18, 2)) AS TotalSalesQty,
                  CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18, 2)) AS TotalSalesAmount
            FROM Bill_mas bm
            INNER JOIN Bill_Exp_trn bet
                    ON bm.BillId = bet.BillId
            INNER JOIN Bo_trn bo
                    ON bet.BoSl = bo.BoSl
            INNER JOIN Product p
                    ON bo.ProductId = p.ProductId
            INNER JOIN ItemDesign d
                    ON p.DesignId = d.DesignId
            WHERE bm.AccountId = @AccountId
              AND bm.BillDate BETWEEN @StartDate AND @EndDate
            GROUP BY
                  d.DesignId,
                  d.DesignCode,
                  d.DesignName
        ),
        DesignBoSl AS (
            SELECT
                  p2.DesignId,
                  bo2.BoSl,
                  CAST(ISNULL(MAX(bo2.Quantity), 0) AS DECIMAL(18, 2)) AS Quantity,
                  CAST(ISNULL(MAX(bo2.AddlQty), 0) AS DECIMAL(18, 2)) AS AddlQty,
                  CAST(ISNULL(MAX(bo2.FiledQty), 0) AS DECIMAL(18, 2)) AS FiledQty,
                  CAST(ISNULL(MAX(bo2.Amount), 0) AS DECIMAL(18, 2)) AS Amount,
                  CAST(ISNULL(MAX(bo2.Rate), 0) AS DECIMAL(18, 2)) AS Rate
            FROM Bill_mas bm2
            INNER JOIN Bill_Exp_trn bet2
                    ON bm2.BillId = bet2.BillId
            INNER JOIN Bo_trn bo2
                    ON bet2.BoSl = bo2.BoSl
            INNER JOIN Product p2
                    ON bo2.ProductId = p2.ProductId
            WHERE bm2.AccountId = @AccountId
              AND bm2.BillDate BETWEEN @StartDate AND @EndDate
              AND EXISTS (SELECT 1 FROM DesignSales ds WHERE ds.DesignId = p2.DesignId)
            GROUP BY
                  p2.DesignId,
                  bo2.BoSl
        ),
        DesignOrderAgg AS (
            SELECT
                  DesignId,
                  CAST(ISNULL(SUM(Quantity), 0) AS DECIMAL(18, 2)) AS TotalOrderQty,
                  CAST(ISNULL(SUM(Amount), 0) AS DECIMAL(18, 2)) AS TotalOrderAmount,
                  CAST(ISNULL(SUM(Quantity + AddlQty - FiledQty), 0) AS DECIMAL(18, 2)) AS PendingOrder,
                  CAST(ISNULL(SUM((Quantity + AddlQty - FiledQty) * Rate), 0) AS DECIMAL(18, 2)) AS PendingOrderValue,
                  CAST(ISNULL(SUM(FiledQty), 0) AS DECIMAL(18, 2)) AS CompletedOrderQty
            FROM DesignBoSl
            GROUP BY DesignId
        ),
        DesignBoSlProcess AS (
            SELECT
                  b.DesignId,
                  b.BoSl,
                  CAST(ISNULL((
                      SELECT SUM(ISNULL(Po_trn.Quantity, 0) - ISNULL(LandedQty, 0) - ISNULL(ProducedQty, 0))
                      FROM Po_trn
                      INNER JOIN Pi_trn
                             ON Po_trn.PiSl = Pi_trn.PiSl
                      WHERE Pi_trn.BoSl = b.BoSl
                  ), 0) AS DECIMAL(18, 2)) AS PendingProcess
            FROM DesignBoSl b
        ),
        DesignProcess AS (
            SELECT
                  DesignId,
                  CAST(ISNULL(SUM(PendingProcess), 0) AS DECIMAL(18, 2)) AS PendingProcess
            FROM DesignBoSlProcess
            GROUP BY DesignId
        )
        SELECT
              s.DesignId,
              s.DesignCode,
              s.DesignName,
              CAST(ISNULL(s.TotalSalesQty, 0) AS DECIMAL(18, 2)) AS TotalSalesQty,
              CAST(ISNULL(s.TotalSalesAmount, 0) AS DECIMAL(18, 2)) AS TotalSalesAmount,
              CAST(ISNULL(o.PendingOrder, 0) AS DECIMAL(18, 2)) AS PendingOrder,
              CAST(ISNULL(p.PendingProcess, 0) AS DECIMAL(18, 2)) AS PendingProcess,
              CAST(ISNULL(o.TotalOrderQty, 0) AS DECIMAL(18, 2)) AS TotalOrderQty,
              CAST(ISNULL(o.TotalOrderAmount, 0) AS DECIMAL(18, 2)) AS TotalOrderAmount,
              CAST(ISNULL(o.PendingOrderValue, 0) AS DECIMAL(18, 2)) AS PendingOrderValue,
              CAST(ISNULL(o.CompletedOrderQty, 0) AS DECIMAL(18, 2)) AS CompletedOrderQty
        FROM DesignSales s
        LEFT JOIN DesignOrderAgg o
               ON o.DesignId = s.DesignId
        LEFT JOIN DesignProcess p
               ON p.DesignId = s.DesignId
        ORDER BY s.DesignCode;
    END

    ---------------------------------------------------------------------------
    -- GetDesignThumbnails
    -- Thumbnail batch load (TVP @DesignIds dbo.IntIdList)
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetDesignThumbnails')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM @DesignIds)
            RETURN;

        SELECT
              d.DesignId,
              d.ImgThumbData
        FROM ItemDesign d
        INNER JOIN @DesignIds ids
                ON ids.Id = d.DesignId
        WHERE d.ImgThumbData IS NOT NULL;
    END

    ---------------------------------------------------------------------------
    -- GetAccountDetails
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetAccountDetails')
    BEGIN
        IF (@AccountId IS NULL OR @AccountId <= 0)
        BEGIN
            RAISERROR('AccountId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              CAST(AccountId AS INT) AS AccountId,
              ISNULL(NULLIF(LTRIM(RTRIM(AccountName)), N''), N'-') AS AccountName,
              ISNULL(NULLIF(LTRIM(RTRIM(AccountCode)), N''), N'-') AS AccountCode,
              ISNULL(NULLIF(LTRIM(RTRIM(Address)), N''), N'-') AS Address,
              ISNULL(NULLIF(LTRIM(RTRIM(Email)), N''), N'-') AS Email,
              ISNULL(NULLIF(LTRIM(RTRIM(TelNo)), N''), N'-') AS TelNo,
              ISNULL(NULLIF(LTRIM(RTRIM(GstNo)), N''), N'-') AS GstNo
        FROM Account
        WHERE AccountId = @AccountId;
    END

    ---------------------------------------------------------------------------
    -- GetDesignHeader
    -- Design detail header — product, category, stock
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetDesignHeader')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              d.DesignId,
              ISNULL(d.DesignCode, N'') AS DesignCode,
              ISNULL(d.DesignName, N'') AS DesignName,
              d.ImgThumbData,
              CAST(d.AccountId AS INT) AS AccountId,
              ISNULL(NULLIF(LTRIM(RTRIM(prod.ProductName)), N''), N'-') AS ProductName,
              ISNULL(NULLIF(LTRIM(RTRIM(dc.DesCatName)), N''), N'-') AS ProductCategory,
              ISNULL(NULLIF(LTRIM(RTRIM(prod.Composition)), N''), N'-') AS Material,
              CAST(ISNULL(prod.NetWt, 0) AS DECIMAL(18, 2)) AS NetWeight,
              CASE
                  WHEN prod.Active = 1 THEN N'Approved'
                  ELSE N'Inactive'
              END AS Status,
              CAST(ISNULL((
                  SELECT SUM(ISNULL(sd.RecQty, 0) - ISNULL(sd.IssQty, 0))
                  FROM StockDet sd
                  WHERE sd.DesignId = d.DesignId
              ), 0) AS DECIMAL(18, 2)) AS CurrentQuantity
        FROM ItemDesign d
        LEFT JOIN DesignCat dc
               ON dc.DesCatId = d.DesCatId
        OUTER APPLY
        (
            SELECT TOP (1)
                  px.ProductName,
                  px.Composition,
                  px.NetWt,
                  px.Active
            FROM Product px
            WHERE px.DesignId = d.DesignId
            ORDER BY
                  CASE WHEN px.Active = 1 THEN 0 ELSE 1 END,
                  px.ProductName
        ) prod
        WHERE d.DesignId = @DesignId;
    END

    ---------------------------------------------------------------------------
    -- GetDesignSales
    -- Sales totals for one design (optional account + date filters)
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetDesignSales')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              d.DesignId,
              ISNULL(d.DesignCode, N'') AS DesignCode,
              ISNULL(d.DesignName, N'') AS DesignName,
              CAST(ISNULL(SUM(bet.Quantity), 0) AS DECIMAL(18, 2)) AS TotalSalesQty,
              CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18, 2)) AS TotalSalesAmount,
              CAST(0 AS DECIMAL(18, 2)) AS PendingOrder,
              CAST(0 AS DECIMAL(18, 2)) AS PendingProcess
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
               ON bm.BillId = bet.BillId
        INNER JOIN Bo_trn bo
               ON bet.BoSl = bo.BoSl
        INNER JOIN Product p
               ON bo.ProductId = p.ProductId
        INNER JOIN ItemDesign d
               ON p.DesignId = d.DesignId
        WHERE d.DesignId = @DesignId
          AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
          AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
          AND (@EndDate IS NULL OR bm.BillDate <= @EndDate)
        GROUP BY
              d.DesignId,
              d.DesignCode,
              d.DesignName;
    END

    ---------------------------------------------------------------------------
    -- GetProductsByDesign
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetProductsByDesign')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              p.ProductId,
              ISNULL(NULLIF(LTRIM(RTRIM(p.ProductName)), N''), N'-') AS ProductName,
              ISNULL(NULLIF(LTRIM(RTRIM(p.BarCode)), N''), N'-') AS BarCode,
              CAST(ISNULL(p.NetWt, 0) AS DECIMAL(18, 2)) AS NetWt,
              ISNULL(NULLIF(LTRIM(RTRIM(p.Composition)), N''), N'-') AS Composition,
              ISNULL(p.Active, 0) AS Active
        FROM Product p
        WHERE p.DesignId = @DesignId
        ORDER BY p.ProductName;
    END

    ---------------------------------------------------------------------------
    -- GetOrdersByDesign
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetOrdersByDesign')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              CASE
                  WHEN bom.OrderNo IS NOT NULL
                       AND LTRIM(RTRIM(bom.OrderNo)) <> ''
                  THEN bom.OrderNo
                  ELSE ISNULL(CAST(bom.BoNumber AS VARCHAR(30)), N'-')
              END AS OrderNo,
              ISNULL(NULLIF(LTRIM(RTRIM(a.AccountName)), N''), N'-') AS Customer,
              bm.BillDate AS OrderDate,
              CAST(ISNULL(bet.Quantity, 0) AS DECIMAL(18, 2)) AS Quantity,
              CAST(ISNULL(bet.Amount * bm.ExchRate, 0) AS DECIMAL(18, 2)) AS Amount
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
               ON bm.BillId = bet.BillId
        INNER JOIN Bo_trn bo
               ON bet.BoSl = bo.BoSl
        INNER JOIN Bo_mas bom
               ON bo.BoId = bom.BoId
        INNER JOIN Product p
               ON bo.ProductId = p.ProductId
        LEFT JOIN Account a
               ON a.AccountId = bm.AccountId
        WHERE p.DesignId = @DesignId
          AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
          AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
          AND (@EndDate IS NULL OR bm.BillDate <= @EndDate)
        ORDER BY bm.BillDate DESC;
    END

    ---------------------------------------------------------------------------
    -- GetMonthlySales
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetMonthlySales')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              ISNULL(FORMAT(bm.BillDate, 'yyyy-MM'), N'-') AS Label,
              CAST(ISNULL(SUM(bet.Quantity), 0) AS DECIMAL(18, 2)) AS Quantity,
              CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18, 2)) AS Value
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
               ON bm.BillId = bet.BillId
        INNER JOIN Bo_trn bo
               ON bet.BoSl = bo.BoSl
        INNER JOIN Product p
               ON bo.ProductId = p.ProductId
        WHERE p.DesignId = @DesignId
          AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
          AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
          AND (@EndDate IS NULL OR bm.BillDate <= @EndDate)
        GROUP BY FORMAT(bm.BillDate, 'yyyy-MM')
        ORDER BY Label;
    END

    ---------------------------------------------------------------------------
    -- GetYearlySales
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetYearlySales')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              ISNULL(CAST(YEAR(bm.BillDate) AS NVARCHAR(10)), N'-') AS Label,
              CAST(ISNULL(SUM(bet.Quantity), 0) AS DECIMAL(18, 2)) AS Quantity,
              CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18, 2)) AS Value
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
               ON bm.BillId = bet.BillId
        INNER JOIN Bo_trn bo
               ON bet.BoSl = bo.BoSl
        INNER JOIN Product p
               ON bo.ProductId = p.ProductId
        WHERE p.DesignId = @DesignId
          AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
          AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
          AND (@EndDate IS NULL OR bm.BillDate <= @EndDate)
        GROUP BY YEAR(bm.BillDate)
        ORDER BY YEAR(bm.BillDate);
    END

    ---------------------------------------------------------------------------
    -- GetLastSold
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetLastSold')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT MAX(bm.BillDate) AS LastSoldDate
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
               ON bm.BillId = bet.BillId
        INNER JOIN Bo_trn bo
               ON bet.BoSl = bo.BoSl
        INNER JOIN Product p
               ON bo.ProductId = p.ProductId
        WHERE p.DesignId = @DesignId
          AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
          AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
          AND (@EndDate IS NULL OR bm.BillDate <= @EndDate);
    END

    /******************************************************************************
      Action     : GetProduction
      Purpose    : Production grid for a design — one row per ProdSlip_trn line.
                   Always returns at least one row (zeros / '-') when no data.
      Parameters : @DesignId
      Returns    : ProductionDate, Location, ProducedQuantity, RequiredQuantity
    ******************************************************************************/
    ELSE IF (@Action = N'GetProduction')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        -- Always return at least one row so the Production grid never renders empty.
        IF NOT EXISTS (
            SELECT 1
            FROM ProdSlip_trn pt
            WHERE pt.DesignId = @DesignId
        )
        BEGIN
            SELECT
                  CAST(NULL AS SMALLDATETIME) AS ProductionDate,
                  CAST(N'-' AS NVARCHAR(250)) AS Location,
                  CAST(0 AS DECIMAL(18, 2)) AS ProducedQuantity,
                  CAST(0 AS DECIMAL(18, 2)) AS RequiredQuantity;
            RETURN;
        END;

        SELECT
              pm.ProdSlipDate AS ProductionDate,
              ISNULL(NULLIF(LTRIM(RTRIM(loc.AccountName)), N''), N'-') AS Location,
              CAST(ISNULL(pt.Quantity, 0) AS DECIMAL(18, 2)) AS ProducedQuantity,
              CAST(ISNULL(pot.Quantity, 0) AS DECIMAL(18, 2)) AS RequiredQuantity
        FROM ProdSlip_trn pt
        INNER JOIN ProdSlip_mas pm
                ON pm.ProdSlipId = pt.ProdSlipId
        LEFT JOIN Po_trn pot
               ON pot.PoSl = pt.PoSl
        LEFT JOIN Po_mas po
               ON po.PoId = ISNULL(pm.PoId, pot.PoId)
        LEFT JOIN Account loc
               ON loc.AccountId = COALESCE(po.LocationId, pm.AccountId)
        WHERE pt.DesignId = @DesignId
        ORDER BY
              pm.ProdSlipDate DESC;
    END

    ---------------------------------------------------------------------------
    -- GetInventory
    -- Current stock from StockDet (RecQty − IssQty)
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetInventory')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              CAST(ISNULL(SUM(ISNULL(sd.RecQty, 0) - ISNULL(sd.IssQty, 0)), 0) AS DECIMAL(18, 2)) AS CurrentStock
        FROM StockDet sd
        WHERE sd.DesignId = @DesignId;
    END

    ELSE
    BEGIN
        RAISERROR('Unknown Action: %s', 16, 1, @Action);
        RETURN;
    END
END
GO
