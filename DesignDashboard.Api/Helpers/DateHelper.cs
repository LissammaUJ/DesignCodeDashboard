namespace DesignDashboard.Api.Helpers;

public static class DateHelper
{
    public static DateTime StartOfDay(DateTime date) => date.Date;

    public static DateTime EndOfDay(DateTime date) => date.Date.AddDays(1).AddTicks(-1);
}
