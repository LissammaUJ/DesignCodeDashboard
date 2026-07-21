use CarolERP

go

--. Total Sales Quantity
--DECLARE @DesignId INT = 6636;

SELECT
    SUM(bet.Quantity) AS TotalSalesQuantity
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId;
--2. Total Sales Value
--DECLARE @DesignId INT = 6636;

SELECT
    SUM(bet.Amount * bm.ExchRate) AS TotalSalesValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId;
--3. Average Sales Price
--DECLARE @DesignId INT = 6636;

SELECT
    SUM(bet.Amount * bm.ExchRate) / NULLIF(SUM(bet.Quantity),0) AS AverageSalesPrice
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId;
--4. Last Sales Date
--DECLARE @DesignId INT = 6636;

SELECT
    MAX(bm.BillDate) AS LastSalesDate
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId;
--5. Monthly Sales
--DECLARE @DesignId INT = 6636;

SELECT
    FORMAT(bm.BillDate,'yyyy-MM') AS SalesMonth,
    SUM(bet.Amount * bm.ExchRate) AS SalesValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId
GROUP BY FORMAT(bm.BillDate,'yyyy-MM')
ORDER BY SalesMonth;
--6. Yearly Sales
--DECLARE @DesignId INT = 6636;

SELECT
    YEAR(bm.BillDate) AS SalesYear,
    SUM(bet.Amount * bm.ExchRate) AS SalesValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId
GROUP BY YEAR(bm.BillDate)
ORDER BY SalesYear;
--7. Top Customer
----DECLARE @DesignId INT = 6636;

SELECT
    a.AccountName,
    SUM(bet.Amount * bm.ExchRate) AS SalesValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
INNER JOIN Account a
    ON bm.AccountId = a.AccountId
WHERE p.DesignId = @DesignId
GROUP BY a.AccountName
ORDER BY SalesValue DESC;
--8. One Query to Verify Everything
--DECLARE @DesignId INT = 6636;

SELECT
    SUM(bet.Quantity) AS TotalQty,
    SUM(bet.Amount * bm.ExchRate) AS TotalValue,
    SUM(bet.Amount * bm.ExchRate) / NULLIF(SUM(bet.Quantity),0) AS AvgPrice,
    MAX(bm.BillDate) AS LastSalesDate
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId;

--Monthly Sales Chart
--DECLARE @DesignId INT = 6636;

SELECT
    FORMAT(bm.BillDate,'yyyy-MM') AS SalesMonth,
    SUM(bet.Amount * bm.ExchRate) AS SalesValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId
GROUP BY FORMAT(bm.BillDate,'yyyy-MM')
ORDER BY SalesMonth;

--Expected:

--SalesMonth	SalesValue
--2024-10	1400

--2. Yearly Sales Chart
--DECLARE @DesignId INT = 6636;

SELECT
    YEAR(bm.BillDate) AS SalesYear,
    SUM(bet.Amount * bm.ExchRate) AS SalesValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId
GROUP BY YEAR(bm.BillDate)
ORDER BY SalesYear;

--Expected:

--SalesYear	SalesValue
--2024	1400
--3. Top Customer
DECLARE @DesignId INT = 6636;

SELECT
    a.AccountName,
    SUM(bet.Amount * bm.ExchRate) AS SalesValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
INNER JOIN Account a
    ON bm.AccountId = a.AccountId
WHERE p.DesignId = @DesignId
GROUP BY a.AccountName
ORDER BY SalesValue DESC;

--Expected:

--AccountName	SalesValue
--10 MERCH, LLC