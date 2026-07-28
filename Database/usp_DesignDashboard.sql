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
-- Used by: GetProductNames, GetDesignThumbnails
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
    @ProductId   INT = NULL,
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
    -- Design Cards — sales by AccountId + date range
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
              d.DesignCode,
              d.DesignName,
              CAST(SUM(bet.Quantity) AS DECIMAL(18, 2)) AS TotalSalesQty,
              CAST(SUM(bet.Amount * bm.ExchRate) AS DECIMAL(18, 2)) AS TotalSalesAmount,
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
        WHERE bm.AccountId = @AccountId
          AND bm.BillDate BETWEEN @StartDate AND @EndDate
        GROUP BY
              d.DesignId,
              d.DesignCode,
              d.DesignName
        ORDER BY
              d.DesignCode;
    END

    ---------------------------------------------------------------------------
    -- GetDesignList
    -- Identical to GetCustomerSales
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetDesignList')
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
              d.DesignCode,
              d.DesignName,
              CAST(SUM(bet.Quantity) AS DECIMAL(18, 2)) AS TotalSalesQty,
              CAST(SUM(bet.Amount * bm.ExchRate) AS DECIMAL(18, 2)) AS TotalSalesAmount,
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
        WHERE bm.AccountId = @AccountId
          AND bm.BillDate BETWEEN @StartDate AND @EndDate
        GROUP BY
              d.DesignId,
              d.DesignCode,
              d.DesignName
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
                  d.DesignCode,
                  d.DesignName,
                  CAST(SUM(bet.Quantity) AS DECIMAL(18, 2)) AS TotalSalesQty,
                  CAST(SUM(bet.Amount * bm.ExchRate) AS DECIMAL(18, 2)) AS TotalSalesAmount
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
                  CAST(MAX(bo2.Quantity) AS DECIMAL(18, 2)) AS Quantity,
                  CAST(MAX(bo2.AddlQty) AS DECIMAL(18, 2)) AS AddlQty,
                  CAST(MAX(bo2.FiledQty) AS DECIMAL(18, 2)) AS FiledQty,
                  CAST(MAX(bo2.Amount) AS DECIMAL(18, 2)) AS Amount,
                  CAST(MAX(bo2.Rate) AS DECIMAL(18, 2)) AS Rate
            FROM Bill_mas bm2
            INNER JOIN Bill_Exp_trn bet2
                    ON bm2.BillId = bet2.BillId
            INNER JOIN Bo_trn bo2
                    ON bet2.BoSl = bo2.BoSl
            INNER JOIN Product p2
                    ON bo2.ProductId = p2.ProductId
            WHERE bm2.AccountId = @AccountId
              AND bm2.BillDate BETWEEN @StartDate AND @EndDate
              AND p2.DesignId IN (SELECT DesignId FROM DesignSales)
            GROUP BY
                  p2.DesignId,
                  bo2.BoSl
        ),
        DesignOrderAgg AS (
            SELECT
                  DesignId,
                  CAST(SUM(Quantity) AS DECIMAL(18, 2)) AS TotalOrderQty,
                  CAST(SUM(Amount) AS DECIMAL(18, 2)) AS TotalOrderAmount,
                  CAST(SUM(Quantity + AddlQty - FiledQty) AS DECIMAL(18, 2)) AS PendingOrder,
                  CAST(SUM((Quantity + AddlQty - FiledQty) * Rate) AS DECIMAL(18, 2)) AS PendingOrderValue,
                  CAST(SUM(FiledQty) AS DECIMAL(18, 2)) AS CompletedOrderQty
            FROM DesignBoSl
            GROUP BY DesignId
        ),
        DesignBoSlProcess AS (
            SELECT
                  b.DesignId,
                  b.BoSl,
                  CAST(ISNULL((
                      SELECT SUM(Po_trn.Quantity - LandedQty - ProducedQty)
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
                  CAST(SUM(PendingProcess) AS DECIMAL(18, 2)) AS PendingProcess
            FROM DesignBoSlProcess
            GROUP BY DesignId
        )
        SELECT
              s.DesignId,
              s.DesignCode,
              s.DesignName,
              s.TotalSalesQty,
              s.TotalSalesAmount,
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
    -- GetSalesTrend
    -- Dashboard chart — monthly sales value
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetSalesTrend')
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
              FORMAT(bm.BillDate, 'yyyy-MM') AS Label,
              CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18, 2)) AS Value
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
                ON bm.BillId = bet.BillId
        WHERE bm.AccountId = @AccountId
          AND bm.BillDate BETWEEN @StartDate AND @EndDate
        GROUP BY FORMAT(bm.BillDate, 'yyyy-MM')
        ORDER BY Label;
    END

    ---------------------------------------------------------------------------
    -- GetTopCustomers
    -- Dashboard chart — Top 10 customers by sales value
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetTopCustomers')
    BEGIN
        IF (@StartDate IS NULL OR @EndDate IS NULL OR @EndDate < @StartDate)
        BEGIN
            RAISERROR('StartDate and EndDate are required, and EndDate must be >= StartDate.', 16, 1);
            RETURN;
        END;

        SELECT TOP 10
              a.AccountName AS Label,
              CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18, 2)) AS Value
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
                ON bm.BillId = bet.BillId
        INNER JOIN Account a
                ON a.AccountId = bm.AccountId
        WHERE bm.BillDate BETWEEN @StartDate AND @EndDate
          AND a.Active = 1
        GROUP BY a.AccountName
        ORDER BY Value DESC;
    END

    ---------------------------------------------------------------------------
    -- GetTopCategories
    -- Dashboard chart — Top 10 design categories by sales value
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetTopCategories')
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

        SELECT TOP 10
              ISNULL(dc.DesCatName, 'Uncategorized') AS Label,
              CAST(ISNULL(SUM(bet.Amount * bm.ExchRate), 0) AS DECIMAL(18, 2)) AS Value
        FROM Bill_mas bm
        INNER JOIN Bill_Exp_trn bet
                ON bm.BillId = bet.BillId
        INNER JOIN Bo_trn bo
                ON bet.BoSl = bo.BoSl
        INNER JOIN Product p
                ON bo.ProductId = p.ProductId
        INNER JOIN ItemDesign d
                ON p.DesignId = d.DesignId
        LEFT JOIN DesignCat dc
               ON dc.DesCatId = d.DesCatId
        WHERE bm.AccountId = @AccountId
          AND bm.BillDate BETWEEN @StartDate AND @EndDate
        GROUP BY ISNULL(dc.DesCatName, 'Uncategorized')
        ORDER BY Value DESC;
    END

    ---------------------------------------------------------------------------
    -- GetProductNames
    -- Product name enrichment (TVP @DesignIds dbo.IntIdList)
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetProductNames')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM @DesignIds)
            RETURN;

        SELECT
              x.DesignId,
              x.ProductName
        FROM (
            SELECT
                  p.DesignId,
                  p.ProductName,
                  ROW_NUMBER() OVER (
                      PARTITION BY p.DesignId
                      ORDER BY CASE WHEN p.Active = 1 THEN 0 ELSE 1 END, p.ProductName
                  ) AS rn
            FROM Product p
            INNER JOIN @DesignIds ids
                    ON ids.Id = p.DesignId
        ) x
        WHERE x.rn = 1;
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
    -- GetAccountName
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetAccountName')
    BEGIN
        IF (@AccountId IS NULL OR @AccountId <= 0)
        BEGIN
            RAISERROR('AccountId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT AccountName
        FROM Account
        WHERE AccountId = @AccountId;
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
              AccountName,
              AccountCode,
              Address,
              Email,
              TelNo,
              GstNo
        FROM Account
        WHERE AccountId = @AccountId;
    END

    ---------------------------------------------------------------------------
    -- GetDesignHeader
    -- Design detail header (ItemDesign + Account + DesignCat)
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
              d.DesignCode,
              d.DesignName,
              d.ImgThumbData,
              CAST(d.AccountId AS INT) AS AccountId,
              a.AccountName AS CustomerName,
              dc.DesCatName AS CategoryName
        FROM ItemDesign d
        LEFT JOIN Account a
               ON a.AccountId = d.AccountId
        LEFT JOIN DesignCat dc
               ON dc.DesCatId = d.DesCatId
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
              d.DesignCode,
              d.DesignName,
              CAST(SUM(bet.Quantity) AS DECIMAL(18, 2)) AS TotalSalesQty,
              CAST(SUM(bet.Amount * bm.ExchRate) AS DECIMAL(18, 2)) AS TotalSalesAmount,
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
              p.ProductName,
              p.BarCode,
              CAST(p.NetWt AS DECIMAL(18, 2)) AS NetWt,
              p.Composition,
              p.Active
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
                  ELSE CAST(bom.BoNumber AS VARCHAR(30))
              END AS OrderNo,
              ISNULL(a.AccountName, '') AS Customer,
              bm.BillDate AS OrderDate,
              CAST(bet.Quantity AS DECIMAL(18, 2)) AS Quantity,
              CAST((bet.Amount * bm.ExchRate) AS DECIMAL(18, 2)) AS Amount
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
              FORMAT(bm.BillDate, 'yyyy-MM') AS Label,
              CAST(SUM(bet.Quantity) AS DECIMAL(18, 2)) AS Quantity,
              CAST(SUM(bet.Amount * bm.ExchRate) AS DECIMAL(18, 2)) AS Value
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
              CAST(YEAR(bm.BillDate) AS NVARCHAR(10)) AS Label,
              CAST(SUM(bet.Quantity) AS DECIMAL(18, 2)) AS Quantity,
              CAST(SUM(bet.Amount * bm.ExchRate) AS DECIMAL(18, 2)) AS Value
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

    ---------------------------------------------------------------------------
    -- GetProduction
    -- Production summary from ProdSlip
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetProduction')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              CAST(SUM(pt.Quantity) AS DECIMAL(18, 2)) AS ProductionQuantity,
              CAST(SUM(CASE WHEN ISNULL(pm.Closed, 0) = 1 THEN pt.Quantity ELSE 0 END) AS DECIMAL(18, 2)) AS CompletedQuantity,
              CAST(SUM(CASE WHEN ISNULL(pm.Closed, 0) = 0 THEN pt.Quantity ELSE 0 END) AS DECIMAL(18, 2)) AS PendingQuantity,
              CAST(SUM(ISNULL(pt.RejQty, 0)) AS DECIMAL(18, 2)) AS RejectedQuantity,
              MAX(pm.ProdSlipDate) AS ProductionDate,
              ISNULL(MAX(pr.ProcessName), '') AS Department,
              ISNULL(MAX(e.EmplName), '') AS Supervisor
        FROM ProdSlip_trn pt
        INNER JOIN ProdSlip_mas pm
                ON pm.ProdSlipId = pt.ProdSlipId
        LEFT JOIN Process pr
               ON pr.ProcessId = COALESCE(pt.ProcessId, pm.ProcessId)
        LEFT JOIN Employee e
               ON e.EmplId = COALESCE(pm.InspEmplId, pm.Saved_Emp)
        WHERE pt.DesignId = @DesignId;
    END

    ---------------------------------------------------------------------------
    -- GetProductionFromBo
    -- Production fallback from booking (Bo_trn / Bo_mas)
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetProductionFromBo')
    BEGIN
        IF (@DesignId IS NULL OR @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT
              CAST(SUM(bt.Quantity) AS DECIMAL(18, 2)) AS ProductionQuantity,
              CAST(0 AS DECIMAL(18, 2)) AS CompletedQuantity,
              CAST(0 AS DECIMAL(18, 2)) AS PendingQuantity,
              CAST(0 AS DECIMAL(18, 2)) AS RejectedQuantity,
              MAX(bm.BoDate) AS ProductionDate,
              CAST('' AS NVARCHAR(100)) AS Department,
              CAST('' AS NVARCHAR(100)) AS Supervisor
        FROM ItemDesign d
        INNER JOIN Product p
                ON d.DesignId = p.DesignId
        INNER JOIN Bo_trn bt
                ON p.ProductId = bt.ProductId
        INNER JOIN Bo_mas bm
                ON bt.BoId = bm.BoId
        WHERE d.DesignId = @DesignId;
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

    ---------------------------------------------------------------------------
    -- GetProducts
    -- Active products (TOP 500) with optional DesignId / AccountId
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetProducts')
    BEGIN
        IF (@DesignId IS NOT NULL AND @DesignId <= 0)
        BEGIN
            RAISERROR('DesignId, when provided, must be greater than zero.', 16, 1);
            RETURN;
        END;

        IF (@AccountId IS NOT NULL AND @AccountId <= 0)
        BEGIN
            RAISERROR('AccountId, when provided, must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT TOP 500
              p.ProductId,
              p.ProductName,
              p.DesignId,
              p.BarCode,
              CAST(p.NetWt AS DECIMAL(18, 2)) AS NetWt,
              p.Composition,
              CAST(CASE WHEN p.Active = 1 THEN 1 ELSE 0 END AS BIT) AS Active,
              pa.AcSpecCode,
              pa.AcSpecName,
              CAST(pa.Rate AS DECIMAL(18, 2)) AS Rate
        FROM Product p
        LEFT JOIN Product_Account pa
               ON pa.ProductId = p.ProductId
              AND (@AccountId IS NULL OR pa.AccountId = @AccountId)
        WHERE (@DesignId IS NULL OR p.DesignId = @DesignId)
          AND p.Active = 1
        ORDER BY p.ProductName;
    END

    ---------------------------------------------------------------------------
    -- GetProductById
    -- Single product by ProductId with optional AccountId
    ---------------------------------------------------------------------------
    ELSE IF (@Action = N'GetProductById')
    BEGIN
        IF (@ProductId IS NULL OR @ProductId <= 0)
        BEGIN
            RAISERROR('ProductId is required and must be greater than zero.', 16, 1);
            RETURN;
        END;

        IF (@AccountId IS NOT NULL AND @AccountId <= 0)
        BEGIN
            RAISERROR('AccountId, when provided, must be greater than zero.', 16, 1);
            RETURN;
        END;

        SELECT TOP 1
              p.ProductId,
              p.ProductName,
              p.DesignId,
              p.BarCode,
              CAST(p.NetWt AS DECIMAL(18, 2)) AS NetWt,
              p.Composition,
              CAST(CASE WHEN p.Active = 1 THEN 1 ELSE 0 END AS BIT) AS Active,
              pa.AcSpecCode,
              pa.AcSpecName,
              CAST(pa.Rate AS DECIMAL(18, 2)) AS Rate
        FROM Product p
        LEFT JOIN Product_Account pa
               ON pa.ProductId = p.ProductId
              AND (@AccountId IS NULL OR pa.AccountId = @AccountId)
        WHERE p.ProductId = @ProductId;
    END

    ELSE
    BEGIN
        RAISERROR('Unknown Action: %s', 16, 1, @Action);
        RETURN;
    END
END
GO

-- =============================================================================
-- End of usp_DesignDashboard.sql
-- Objects deployed:
--   Type : dbo.IntIdList (if not exists)
--   SP   : dbo.usp_DesignDashboard (CREATE OR ALTER)
-- =============================================================================
