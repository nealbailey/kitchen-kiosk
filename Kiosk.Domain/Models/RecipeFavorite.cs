using System;
using System.Collections.Generic;

#nullable disable

namespace KioskApi.Domain.Models
{
    public partial class RecipeFavorite
    {
        public int RecId { get; set; }
        public Guid Useruid { get; set; }
    }
}
