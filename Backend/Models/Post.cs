using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Post
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    // Храним пути к изображениям как JSON-массив
    public string ImagesJson { get; set; } = "[]";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Для удобства работы с изображениями
    public List<string> Images
    {
        get => string.IsNullOrEmpty(ImagesJson)
            ? new List<string>()
            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(ImagesJson) ?? new List<string>();
        set => ImagesJson = System.Text.Json.JsonSerializer.Serialize(value);
    }
}