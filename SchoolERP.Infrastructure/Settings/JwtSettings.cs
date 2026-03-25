namespace SchoolERP.Infrastructure.Settings;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public TimeSpan TokenLifetime { get; set; }
}
