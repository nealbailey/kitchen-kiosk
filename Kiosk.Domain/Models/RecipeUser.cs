#nullable disable

namespace KioskApi.Domain.Models
{
    public partial class RecipeUser
    {
        public RecipeUser()
        {
        }

        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }        
    }
}
