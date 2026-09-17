#nullable disable

using System;

namespace KioskApi.Domain.Models
{
    public partial class RecipeUser
    {
        public RecipeUser()
        {
        }

        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }        
    }
}
