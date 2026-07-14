using System.Text.Json;
using DesignDashboard.Api.DTOs;

namespace DesignDashboard.Api.Middleware;

public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger,
    IHostEnvironment environment)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex) when (IsCancellation(ex, context))
        {
            // Browser/Angular aborted the request (slow query, refresh, HMR). Do not treat as 500.
            logger.LogDebug(
                ex,
                "Request cancelled for {Method} {Path}",
                context.Request.Method,
                context.Request.Path.Value);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static bool IsCancellation(Exception exception, HttpContext context) =>
        exception is OperationCanceledException or TaskCanceledException
        || context.RequestAborted.IsCancellationRequested;

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        if (context.RequestAborted.IsCancellationRequested || context.Response.HasStarted)
        {
            return;
        }

        logger.LogError(
            exception,
            "Unhandled exception for {Method} {Path}",
            context.Request.Method,
            context.Request.Path.Value);

        var (statusCode, message) = exception switch
        {
            ArgumentException => (StatusCodes.Status400BadRequest, exception.Message),
            KeyNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
        };

        var response = new ApiErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Details = environment.IsDevelopment() ? exception.ToString() : null
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }
}
