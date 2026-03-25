using Microsoft.AspNetCore.Http;

namespace SchoolERP.Application.Interfaces;

public interface IFileService
{
    Task<string> UploadFileAsync(IFormFile file, string folderName);
    void DeleteFile(string fileUrl);
}
