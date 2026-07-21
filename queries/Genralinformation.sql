--Design Details
--DECLARE @DesignId INT = 6636;

SELECT
DesignId,
DesignCode,
DesignName
FROM ItemDesign
WHERE DesignId=@DesignId;
--Customer
--DECLARE @DesignId INT = 6636;

SELECT
a.AccountId,
a.AccountName
FROM ItemDesign d
LEFT JOIN Account a
ON d.AccountId=a.AccountId
WHERE d.DesignId=@DesignId;
--Category
--DECLARE @DesignId INT = 6636;

SELECT
dc.DesCatName
FROM ItemDesign d
LEFT JOIN DesignCat dc
ON d.DesCatId=dc.DesCatId
WHERE d.DesignId=@DesignId;
--Product Details
DECLARE @DesignId INT = 6636;

SELECT
ProductId,
ProductName,
Composition,
BarCode,
NetWt,
Active
FROM Product
WHERE DesignId=@DesignId;