# Design Dashboard API

Read-only ASP.NET Core Web API (Stored Procedures + ADO.NET + SQL Server) for the Angular Design Code Dashboard.

> **Runtime note:** This machine has .NET 10 installed (not .NET 8). The project currently targets `net10.0` so it runs locally. To target ASP.NET Core 8, change `<TargetFramework>` to `net8.0` after installing the [.NET 8 SDK/runtime](https://dotnet.microsoft.com/download/dotnet/8.0).

## Run

```bash
cd DesignDashboard.Api
dotnet restore
dotnet run --launch-profile http
```

- Swagger UI: http://localhost:5000/swagger
- Base URL: http://localhost:5000

## Endpoints (GET only)

| Method | Route | Query |
|--------|-------|-------|
| GET | `/api/customer` | `startDate`, `endDate` |
| GET | `/api/customer-sales` | `accountId` (or `customerAccountId`), `startDate`, `endDate` |
| GET | `/api/designs` | `accountId` / `customerAccountId`, `startDate`, `endDate` |
| GET | `/api/design/{designId}` | optional `accountId` / `customerAccountId`, `startDate`, `endDate` |
| GET | `/api/designs/{designId}/production` | — |
| GET | `/api/designs/{designId}/inventory` | — |
| GET | `/api/dashboard/summary` | same filter |
| GET | `/api/product` | optional `designId`, `accountId` |
| GET | `/api/product/{id}` | optional `accountId` |

## Architecture

```
Controller → Service → Repository → ADO.NET → dbo.usp_DesignDashboard (@Action)
```

- Single Stored Procedure: `dbo.usp_DesignDashboard` (deploy `Database/usp_DesignDashboard.sql`)
- SqlConnection + SqlCommand + SqlParameter + SqlDataReader
- Global exception middleware + logging
- Swagger / OpenAPI
- CORS enabled (Angular via `ng serve` on `:4200` proxies `/api` → `http://localhost:5000`)

## Visual Studio / rebuild tip

If you see **MSB3027** (`Could not copy … DesignDashboard.Api.exe` / file locked):

1. A previous debug session or `dotnet run` is still holding the EXE (not IIS Express — this project uses **Kestrel** via the `http` profile).
2. The project now runs `taskkill /IM DesignDashboard.Api.exe` **before each build**, so **Build / Rebuild works without restarting Visual Studio**.
3. Prefer one runner only: either Visual Studio **F5**, or Cursor/`dotnet run` — not both on port 5000.
4. Clean/Rebuild: **Build → Clean Solution**, then **Rebuild**, or:

```bash
dotnet clean
dotnet build
dotnet run --launch-profile http
```

URL binding is only in `Properties/launchSettings.json` (`http://localhost:5000`). Do not also set `Kestrel:Endpoints` in Development appsettings (that caused address override warnings).
