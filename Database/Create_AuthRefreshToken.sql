-- =============================================================================
-- Design Dashboard — Refresh Token table
-- Database : CarolERP
-- Safe     : IF NOT EXISTS — may be re-run
-- =============================================================================

USE CarolERP;
GO

IF OBJECT_ID(N'dbo.AuthRefreshToken', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuthRefreshToken
    (
        Id                BIGINT         NOT NULL IDENTITY(1, 1) CONSTRAINT PK_AuthRefreshToken PRIMARY KEY,
        TokenHash         CHAR(64)       NOT NULL,              -- SHA-256 hex of refresh token
        EmplId            SMALLINT       NOT NULL,
        EmplCode          VARCHAR(10)    NOT NULL,
        EmplName          NVARCHAR(100)  NULL,
        IsAdmin           BIT            NOT NULL CONSTRAINT DF_AuthRefreshToken_IsAdmin DEFAULT (0),
        CoId              TINYINT        NOT NULL,
        CoName            NVARCHAR(100)  NULL,
        CreatedAtUtc      DATETIME2(3)   NOT NULL CONSTRAINT DF_AuthRefreshToken_CreatedAtUtc DEFAULT (SYSUTCDATETIME()),
        ExpiresAtUtc      DATETIME2(3)   NOT NULL,
        RevokedAtUtc      DATETIME2(3)   NULL,
        ReplacedByHash    CHAR(64)       NULL,
        CreatedByIp       NVARCHAR(64)   NULL
    );

    CREATE UNIQUE INDEX UX_AuthRefreshToken_TokenHash
        ON dbo.AuthRefreshToken (TokenHash);

    CREATE INDEX IX_AuthRefreshToken_EmplId_Active
        ON dbo.AuthRefreshToken (EmplId, RevokedAtUtc, ExpiresAtUtc);
END
GO
