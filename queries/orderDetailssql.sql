--Order Details (Same as API)
--DECLARE @DesignId INT = 6636;
DECLARE @AccountId INT = NULL;
DECLARE @StartDate DATE = NULL;
DECLARE @EndDate DATE = NULL;

SELECT
    bm.BillId AS BillNo,
    a.AccountName AS Customer,
    bet.Quantity,
    bm.BillDate,
    bet.Amount,
    bm.ExchRate,
    (bet.Amount * bm.ExchRate) AS OrderValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
LEFT JOIN Account a
    ON bm.AccountId = a.AccountId
WHERE p.DesignId = @DesignId
AND (@AccountId IS NULL OR bm.AccountId = @AccountId)
AND (@StartDate IS NULL OR bm.BillDate >= @StartDate)
AND (@EndDate IS NULL OR bm.BillDate <= @EndDate)
ORDER BY bm.BillDate DESC;
--2. Verify Bill Number
--DECLARE @DesignId INT = 6636;

SELECT DISTINCT
    bm.BillId,
    bm.BillDate
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId
ORDER BY bm.BillDate DESC;
--3. Verify Customer
--DECLARE @DesignId INT = 6636;

SELECT
    bm.BillId,
    a.AccountId,
    a.AccountName
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
LEFT JOIN Account a
    ON bm.AccountId = a.AccountId
WHERE p.DesignId = @DesignId;
--4. Verify Quantity
--DECLARE @DesignId INT = 6636;

SELECT
    bm.BillId,
    bet.Quantity
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId;
--5. Verify Order Value
--DECLARE @DesignId INT = 6636;

SELECT
    bm.BillId,
    bet.Amount,
    bm.ExchRate,
    (bet.Amount * bm.ExchRate) AS OrderValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId;
--6. Verify Bill Date
--DECLARE @DesignId INT = 6636;

SELECT
    bm.BillId,
    bm.BillDate
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId
ORDER BY bm.BillDate DESC;
--7. Verify Duplicate Orders
--DECLARE @DesignId INT = 6636;

SELECT
    bm.BillId,
    COUNT(*) AS LineCount
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId
GROUP BY bm.BillId
ORDER BY bm.BillId;
--8. Verify Total Order Value
--DECLARE @DesignId INT = 6636;

SELECT
    SUM(bet.Quantity) AS TotalQuantity,
    SUM(bet.Amount * bm.ExchRate) AS TotalOrderValue
FROM Bill_mas bm
INNER JOIN Bill_Exp_trn bet
    ON bm.BillId = bet.BillId
INNER JOIN Bo_trn bo
    ON bet.BoSl = bo.BoSl
INNER JOIN Product p
    ON bo.ProductId = p.ProductId
WHERE p.DesignId = @DesignId;
--9. Check if Delivery Date Exists in ERP
SELECT
    t.name AS TableName,
    c.name AS ColumnName
FROM sys.tables t
INNER JOIN sys.columns c
    ON t.object_id = c.object_id
WHERE c.name LIKE '%Delivery%'
   OR c.name LIKE '%Deliver%'
ORDER BY t.name;
--10. Check if Status / Pending / Stage Exists
SELECT
    t.name AS TableName,
    c.name AS ColumnName
FROM sys.tables t
INNER JOIN sys.columns c
    ON t.object_id = c.object_id
WHERE c.name LIKE '%Status%'
   OR c.name LIKE '%Pending%'
   OR c.name LIKE '%Stage%'
ORDER BY t.name;

select * from Bo_mas

DECLARE @DesignId INT = 6636;

SELECT
    p.DesignId,

    CASE
        WHEN bm.OrderNo IS NOT NULL
             AND LTRIM(RTRIM(bm.OrderNo)) <> ''
            THEN bm.OrderNo
        ELSE bm.BillNumber
    END AS OrderNumber,

    a.AccountName AS Customer,

    bet.Quantity,

    ISNULL(bm.OrderDate, bm.BillDate) AS OrderDate,

    bm.BillNumber,

    bm.BillDate,

    bet.Amount * bm.ExchRate AS OrderValue

FROM Product p

INNER JOIN Bo_trn bo
    ON bo.ProductId = p.ProductId

INNER JOIN Bill_Exp_trn bet
    ON bet.BoSl = bo.BoSl

INNER JOIN Bill_mas bm
    ON bm.BillId = bet.BillId

LEFT JOIN Account a
    ON a.AccountId = bm.AccountId

WHERE p.DesignId = @DesignId

ORDER BY bm.BillDate DESC;

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Bill_mas'
ORDER BY ORDINAL_POSITION;


SELECT
    BillId,
    BillNumber,
    OrderNo,
    OrderDate,
    BillDate
FROM Bill_mas
WHERE BillId = 6;

SELECT
    BillId,
    BillNumber,
    OrderNo,
    OrderDate
FROM Bill_mas
WHERE OrderNo IS NOT NULL
ORDER BY BillDate DESC;


DECLARE @DesignId1 INT = 6636;

SELECT
    bm.BillId,
    bm.BillNumber,
    bm.OrderNo,
    bm.OrderDate,
    bm.BillDate,
    a.AccountName,
    bet.Quantity
FROM Product p
INNER JOIN Bo_trn bo
    ON bo.ProductId = p.ProductId
INNER JOIN Bill_Exp_trn bet
    ON bet.BoSl = bo.BoSl
INNER JOIN Bill_mas bm
    ON bm.BillId = bet.BillId
LEFT JOIN Account a
    ON a.AccountId = bm.AccountId
WHERE p.DesignId = @DesignId1;


SELECT
    OrderNo
FROM Bo_mas
WHERE BoId = 1630;
