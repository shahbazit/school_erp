using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;
using SchoolERP.Application.Interfaces;

namespace SchoolERP.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendOtpEmailAsync(string email, string name, string otp)
    {
        var subject = "Your OTP for SchoolERP Registration";
        var body = $@"
            <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;"">
                <h2 style=""color: #2c3e50;"">Welcome to SchoolERP, {name}!</h2>
                <p style=""font-size: 16px; color: #34495e;"">Your one-time password (OTP) for registration is:</p>
                <div style=""text-align: center; margin: 30px 0;"">
                    <span style=""font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3498db; padding: 10px 20px; background-color: #f7f9fa; border-radius: 8px;"">{otp}</span>
                </div>
                <p style=""color: #7f8c8d; font-size: 14px;"">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                <hr style=""border: none; border-top: 1px solid #eee; margin: 20px 0;"" />
                <p style=""color: #bdc3c7; font-size: 12px; text-align: center;"">&copy; {DateTime.Now.Year} SchoolERP. All rights reserved.</p>
            </div>";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendVerificationEmailAsync(string email, string name, string token)
    {
        // For link based verification (if needed later)
        var frontendUrl = _config["EmailSettings:FrontendUrl"];
        var verificationLink = $"{frontendUrl}/verify-email?token={token}&email={email}";
        var subject = "Verify your email - SchoolERP";
        var body = $@"<p>Hello {name}, click <a href='{verificationLink}'>here</a> to verify.</p>";
        await SendEmailAsync(email, subject, body);
    }

    public async Task SendPasswordResetEmailAsync(string email, string name, string token)
    {
        var frontendUrl = _config["EmailSettings:FrontendUrl"];
        var resetLink = $"{frontendUrl}/reset-password?token={token}&email={email}";
        var subject = "Reset your password - SchoolERP";
        var body = $@"<p>Hello {name}, click <a href='{resetLink}'>here</a> to reset your password.</p>";
        await SendEmailAsync(email, subject, body);
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(_config["EmailSettings:SenderName"], _config["EmailSettings:SenderEmail"]));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart(TextFormat.Html) { Text = body };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_config["EmailSettings:SmtpServer"], int.Parse(_config["EmailSettings:SmtpPort"] ?? "587"), SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_config["EmailSettings:SmtpUser"], _config["EmailSettings:SmtpPass"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}
