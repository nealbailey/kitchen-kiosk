//-----------------------------------------------------------------------
// Source File:  "IngredientRepository.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 02/02/2022 12:33:00 PM
// Authors(s):   Neal Bailey <nealbailey@hotmail.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: FocusIT, inc
// Software Rights Holder: Baileysoft Solutions
//-----------------------------------------------------------------------
// The licensee's rights to use, modify, reproduce, release, perform,
// display, or disclose this technical data/computer software are
// restricted by US patent copyright protections. any reproduction
// of this technical data/computer software or portions thereof marked
// with this legend must also reproduce the all original markings.
//-----------------------------------------------------------------------
// Copyright (c) 2012-2022 Baileysoft Solutions.
//-----------------------------------------------------------------------
namespace Kiosk.Data.Repository
{
    using KioskApi.Data;
    using KioskApi.Domain.Models;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class IngredientRepository : BaseRepository, IIngredientRepository
    {
        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="dbContext"></param>
        public IngredientRepository(ILogger<IIngredientRepository> logger, KIOSKContext dbContext)
        {
            _logger = logger;
            _context = dbContext;
        }
        #endregion

        #region Methods

        /// <summary>
        /// Retrieve the <see cref="RecipeIngredient"/> collection for a recipe.
        /// </summary>
        /// <param name="recipe"></param>
        /// <returns></returns>
        public Task<List<RecipeIngredient>> GetByRecipe(Recipe recipe)
        {
            var ingredients = _context.RecipeIngredients.Where(i => i.RecId == recipe.RecId).ToListAsync();
            return Task.Run(() => ingredients);
        }

        #endregion
    }
}
