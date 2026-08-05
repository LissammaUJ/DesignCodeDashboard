using System.Text;
using System.Text.Json.Serialization;
using DesignDashboard.Api.Configuration;
using DesignDashboard.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var startupLogger = LoggerFactory
    .Create(b => b.AddConsole().SetMinimumLevel(LogLevel.Information))
    .CreateLogger("Startup");

startupLogger.LogInformation(
    "Bootstrapping DesignDashboard.Api | Environment={Environment} | ContentRoot={ContentRoot}",
    builder.Environment.EnvironmentName,
    builder.Environment.ContentRootPath);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// JWT settings (Key / Issuer / Audience / ExpiryMinutes)
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt configuration section is missing from appsettings.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key must be at least 32 characters for HMAC SHA-256.");
}

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                startupLogger.LogWarning(
                    context.Exception,
                    "[JWT] Authentication failed for {Path}",
                    context.Request.Path.Value);
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                // Fired when [Authorize] rejects a missing/invalid token.
                startupLogger.LogWarning(
                    "[JWT] Unauthorized challenge for {Method} {Path} | Error={Error}",
                    context.Request.Method,
                    context.Request.Path.Value,
                    context.Error ?? "invalid_token");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var name = context.Principal?.Identity?.Name ?? "(unknown)";
                startupLogger.LogDebug("[JWT] Token validated for user={User}", name);
                return Task.CompletedTask;
            },
        };
    });

// No fallback authorize-all policy — only controllers marked [Authorize] require JWT.
// /api/auth/login stays public via [AllowAnonymous].
builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Design Dashboard API",
        Version = "v1",
        Description = "Read-only ASP.NET Core Web API for the Angular Design Code Dashboard. Protected by JWT except POST /api/auth/login."
    });

    options.AddServer(new OpenApiServer { Url = "/" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT from POST /api/auth/login.",
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer",
                },
            },
            Array.Empty<string>()
        },
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

startupLogger.LogInformation("Registering DI services (no DB connection at startup — ADO.NET is lazy).");
builder.Services.AddDesignDashboardServices();

var erpCs = builder.Configuration.GetConnectionString(DatabaseSettings.ConnectionName);
startupLogger.LogInformation(
    "Connection string '{Name}' present={Present} (SQL is opened only on first API request).",
    DatabaseSettings.ConnectionName,
    !string.IsNullOrWhiteSpace(erpCs));

// SPA + Angular origins: :100, :5000 (API/SPA), :4200 (ng serve).
builder.Services.AddCors(options =>
{
    options.AddPolicy("SpaCors", policy =>
    {
        policy.WithOrigins(
                "http://localhost:100",
                "http://localhost:5000",
                "http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
var log = app.Logger;

log.LogInformation(
    "Pipeline build start | Environment={Environment} | ApplicationName={ApplicationName}",
    app.Environment.EnvironmentName,
    app.Environment.ApplicationName);

app.UseMiddleware<GlobalExceptionMiddleware>();

log.LogInformation("Enabling Swagger + SwaggerUI at /swagger");
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Design Dashboard API v1");
    options.RoutePrefix = "swagger";
    options.DocumentTitle = "Design Dashboard API";
    options.DisplayRequestDuration();
});

// CORS before auth so preflight (OPTIONS) from :4200 succeeds.
app.UseCors("SpaCors");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var name = ctx.File.Name;
        if (name.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
        {
            ctx.Context.Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";
            ctx.Context.Response.Headers.Pragma = "no-cache";
            ctx.Context.Response.Headers.Expires = "0";
        }
    }
});

// Order: Authentication → Authorization → Controllers → SPA fallback
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapFallback(async context =>
{
    var path = context.Request.Path;
    if (path.StartsWithSegments("/api") || path.StartsWithSegments("/swagger"))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.ContentType = "application/json; charset=utf-8";
        await context.Response.WriteAsync(
            """{"title":"Not Found","status":404,"detail":"API route not found."}""");
        return;
    }

    var indexPath = Path.Combine(app.Environment.WebRootPath ?? "wwwroot", "index.html");
    if (!File.Exists(indexPath))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsync("Angular wwwroot/index.html missing. Run: npm run build:wwwroot");
        return;
    }

    context.Response.ContentType = "text/html; charset=utf-8";
    context.Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";
    await context.Response.SendFileAsync(indexPath);
});

log.LogInformation(
    "Starting Kestrel on http://localhost:100 and http://localhost:5000 | Angular :4200 proxies /api → :5000 | Login: /login");
app.Run();
