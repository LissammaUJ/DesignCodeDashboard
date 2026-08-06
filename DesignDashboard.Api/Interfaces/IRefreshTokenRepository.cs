using DesignDashboard.Api.Models;

namespace DesignDashboard.Api.Interfaces;

public interface IRefreshTokenRepository
{
    Task InsertAsync(RefreshToken token, CancellationToken cancellationToken = default);

    Task<RefreshToken?> FindByHashAsync(string tokenHash, CancellationToken cancellationToken = default);

    Task RevokeAsync(string tokenHash, string? replacedByHash, CancellationToken cancellationToken = default);

    Task RevokeAllForEmployeeAsync(short emplId, CancellationToken cancellationToken = default);
}
