using System;
using System.Collections.Generic;

#nullable disable

namespace KioskApi.Domain.Models
{
    public partial class RecipeCategoryMap
    {
        public int CatId { get; set; }
        public int RecId { get; set; }

        public virtual RecipeCategory Cat { get; set; }
        public virtual Recipe Rec { get; set; }
    }
}
