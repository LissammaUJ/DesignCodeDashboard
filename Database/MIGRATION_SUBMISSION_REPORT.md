# Design Dashboard — Stored Procedure Deployment

**Single procedure:** `dbo.usp_DesignDashboard`  
**Deploy file:** `Database/usp_DesignDashboard.sql`

## SSMS steps

1. Open `Database/usp_DesignDashboard.sql`
2. Connect to CarolERP
3. Execute (F5)

Creates:
- `dbo.IntIdList` (if not exists)
- `dbo.usp_DesignDashboard` (CREATE OR ALTER)

API calls only `dbo.usp_DesignDashboard` with `@Action` and filter parameters.
