using System.Text.Json.Serialization;
using DesignDashboard.Api.Configuration;
using DesignDashboard.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Design Dashboard API",
        Version = "v1",
        Description = "Read-only ASP.NET Core Web API for the Angular Design Code Dashboard (Stored Procedures + ADO.NET + SQL Server)."
    });

    // Relative server so Swagger Execute uses the same scheme/host as the UI.
    options.AddServer(new Microsoft.OpenApi.Models.OpenApiServer { Url = "/" });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddDesignDashboardServices();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();

// Development: Swagger → CORS → Authentication → Authorization → Controllers
// No UseHttpsRedirection() in Development (avoids missing developer cert failures).
// URL binding comes from launchSettings.json (http://localhost:5000) only —
// do not also set Kestrel:Endpoints in appsettings.Development.json.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Design Dashboard API v1");
        options.RoutePrefix = "swagger";
        options.DocumentTitle = "Design Dashboard API";
        options.DisplayRequestDuration();
    });
}

app.UseCors("AllowAll");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Prevent browsers from caching index.html (old hashes → stale apiUrl like localhost:5000).
        if (string.Equals(ctx.File.Name, "index.html", StringComparison.OrdinalIgnoreCase))
        {
            ctx.Context.Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";
            ctx.Context.Response.Headers.Pragma = "no-cache";
            ctx.Context.Response.Headers.Expires = "0";
        }
    }
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();
