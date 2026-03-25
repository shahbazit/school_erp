namespace SchoolERP.Application.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string email, string name, string otp);
    Task SendVerificationEmailAsync(string email, string name, string token);
    Task SendPasswordResetEmailAsync(string email, string name, string token);
    Task SendEmailAsync(string to, string subject, string body);
}
