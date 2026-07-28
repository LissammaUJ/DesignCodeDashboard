using DesignDashboard.Api.Interfaces;
using DesignDashboard.Api.Repositories;
using DesignDashboard.Api.Services;

namespace DesignDashboard.Api.Configuration;

public static class DependencyInjection
{
    public static IServiceCollection AddDesignDashboardServices(this IServiceCollection services)
    {
        services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();

        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IDesignRepository, DesignRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<ICustomerSalesRepository, CustomerSalesRepository>();

        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IDesignService, DesignService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ICustomerSalesService, CustomerSalesService>();

        return services;
    }
}
