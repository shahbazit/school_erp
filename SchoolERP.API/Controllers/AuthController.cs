using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.DTOs.Auth;
using SchoolERP.Application.Interfaces;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IOrganizationService _organizationService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(IAuthService authService, IOrganizationService organizationService, ICurrentUserService currentUserService)
    {
        _authService = authService;
        _organizationService = organizationService;
        _currentUserService = currentUserService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty)
            return BadRequest("Organization context not found (Require X-Organization-Id header)");

        var result = await _authService.RegisterAsync(request.Email, request.Password, request.MobileNumber, request.FirstName, request.LastName, request.Role, orgId);
        
        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var orgId = _organizationService.GetOrganizationId();
        
        // If domain is provided, prioritize it for organization resolution
        if (!string.IsNullOrEmpty(request.SchoolDomain))
        {
            var orgByDomain = await _authService.GetOrganizationByDomainAsync(request.SchoolDomain);
            if (orgByDomain != null)
            {
                orgId = orgByDomain.Id;
            }
        }

        var result = await _authService.LoginAsync(request.Email, request.Password, orgId != Guid.Empty ? orgId : null);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(result);
    }

    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.Token, request.RefreshToken);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(result);
    }

    [HttpPost("generate-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> GenerateOtp([FromBody] GenerateOtpRequest request)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty)
            return BadRequest("Organization context not found (Require X-Organization-Id header)");

        var success = await _authService.GenerateOtpAsync(request.MobileNumber, orgId);

        if (!success)
            return BadRequest(new { Errors = new[] { "Failed to generate OTP. Mobile number not registered." } });

        return Ok(new { Message = "OTP sent successfully. (Check application logs for sandbox value)" });
    }

    [HttpPost("verify-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty)
            return BadRequest("Organization context not found (Require X-Organization-Id header)");

        var result = await _authService.VerifyOtpAsync(request.MobileNumber, request.Otp, orgId);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(result);
    }

    [HttpPost("register-step-1")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterStepOne([FromBody] RegisterStepOneRequest request)
    {
        var result = await _authService.RegisterStepOneAsync(request.Email, request.Password, request.MobileNumber, request.FirstName, request.LastName);
        
        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(result);
    }

    [HttpPost("finalize-registration")]
    [AllowAnonymous]
    public async Task<IActionResult> FinalizeRegistration([FromBody] FinalizeRegistrationRequest request)
    {
        var result = await _authService.FinalizeRegistrationAsync(request.RegistrationUid, request.SchoolName, request.SchoolDomain, request.City, request.Address, request.Otp);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(result);
    }
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var orgId = _organizationService.GetOrganizationId();
        var result = await _authService.ForgotPasswordAsync(request.Email, orgId != Guid.Empty ? orgId : null);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(new { Message = "If that email address is in our database, we will send you an email to reset your password." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var orgId = _organizationService.GetOrganizationId();
        var result = await _authService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword, orgId != Guid.Empty ? orgId : null);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(new { Message = "Password has been successfully reset." });
    }

    [HttpPost("reset-password-force")]
    [Authorize]
    public async Task<IActionResult> ResetPasswordForce([FromBody] ResetPasswordForceRequest request)
    {
        var userId = _currentUserService.UserId;
        
        if (!userId.HasValue)
        {
            // If UserId claim is not standard, we can try reading it manually
            var userIdStr = User.FindFirst("id")?.Value;
            if (Guid.TryParse(userIdStr, out var parsedId))
                userId = parsedId;
        }

        if (!userId.HasValue)
            return Unauthorized(new { Message = "User identity not found." });

        if (string.IsNullOrEmpty(request.NewPassword))
            return BadRequest(new { Errors = new[] { "Password is required" } });

        var result = await _authService.ChangePasswordAsync(userId.Value, request.NewPassword);

        if (!result.Success)
            return BadRequest(new { Errors = result.Errors });

        return Ok(new { Success = true });
    }

    public class ResetPasswordForceRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}
