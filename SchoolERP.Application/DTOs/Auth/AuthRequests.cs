namespace SchoolERP.Application.DTOs.Auth;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "Student"; // Default role
}

public class GenerateOtpRequest
{
    public string MobileNumber { get; set; } = string.Empty;
}

public class VerifyOtpRequest
{
    public string MobileNumber { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? SchoolDomain { get; set; }
}

public class RefreshTokenRequest
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

public class RegisterStepOneRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class FinalizeRegistrationRequest
{
    public Guid RegistrationUid { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string SchoolDomain { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}
