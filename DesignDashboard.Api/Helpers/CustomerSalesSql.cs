namespace DesignDashboard.Api.Helpers;

/// <summary>
/// Company-provided read-only sales query (CarolERP).
/// Do not alter joins/columns — parameters only: @AccountId, @StartDate, @EndDate.
/// </summary>
public static class CustomerSalesSql
{
    public const string ByAccountAndDateRange = """
        SELECT
              sales.DesignId,
              sales.DesignCode,
              sales.DesignName,
              sales.TotalSalesQty,
              sales.TotalSalesAmount,
              sales.PendingOrder,
              sales.PendingProcess,
              d.ImgThumbData
        FROM (
            SELECT
                  d.DesignId,
                  d.DesignCode,
                  d.DesignName,
                  SUM(bet.Quantity) AS TotalSalesQty,
                  SUM(bet.Amount * bm.ExchRate) AS TotalSalesAmount,
                  0 AS PendingOrder,
                  0 AS PendingProcess
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
        ) sales
        INNER JOIN ItemDesign d
               ON d.DesignId = sales.DesignId
        ORDER BY
              sales.DesignCode;
        """;

    /// <summary>Same sales aggregation scoped to one design (live detail popup).</summary>
    public const string ByDesignId = """
        SELECT
              d.DesignId,
              d.DesignCode,
              d.DesignName,
              SUM(bet.Quantity) AS TotalSalesQty,
              SUM(bet.Amount * bm.ExchRate) AS TotalSalesAmount,
              0 AS PendingOrder,
              0 AS PendingProcess
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
        """;
}
