namespace SchoolERP.Infrastructure.Settings;

public class EmailSettings
{
    public string SmtpServer { get; set; } = string.Empty;
    public string SmtpPort { get; set; } = string.Empty;
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPass { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string FrontendUrl { get; set; } = string.Empty;
}
