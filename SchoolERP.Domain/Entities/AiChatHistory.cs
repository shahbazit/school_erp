using SchoolERP.Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolERP.Domain.Entities
{
    public class AiChatHistory : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid ChapterId { get; set; }

        [Required]
        public string Role { get; set; } = string.Empty; // "user" or "ai"

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [ForeignKey("ChapterId")]
        public virtual SubjectChapter Chapter { get; set; } = null!;
    }
}
