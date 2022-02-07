//-----------------------------------------------------------------------
// Source File:  "PaginatedList.cs"
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
namespace Kiosk.Data
{
    using Microsoft.EntityFrameworkCore;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    /// <summary>
    /// Custom List for EFCore Paging
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class PaginatedList<T> : List<T>
    {
        #region Properties
        /// <summary>
        /// The current page number.
        /// </summary>
        public int PageIndex { get; private set; }
        
        /// <summary>
        /// The total number of pages.
        /// </summary>
        public int TotalPages { get; private set; }

        /// <summary>
        /// Determines if there are pages prior to the current one.
        /// </summary>
        public bool HasPreviousPage { get { return (PageIndex > 1); } }

        /// <summary>
        /// Determines if there are additional pages.
        /// </summary>
        public bool HasNextPage { get { return (PageIndex < TotalPages); } }
        #endregion

        #region Constructors

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="items"></param>
        /// <param name="count"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        public PaginatedList(List<T> items, int count, int pageIndex, int pageSize)
        {
            PageIndex = pageIndex;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);

            this.AddRange(items);
        }

        #endregion

        #region Methods
        /// <summary>
        /// Create the paged result-set.
        /// </summary>
        /// <param name="source">The source to page</param>
        /// <param name="pageIndex">The current page</param>
        /// <param name="pageSize">The page size</param>
        /// <returns>Paged list - <see cref="Kiosk.Data.PaginatedList{T}"/></returns>
        public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageIndex, int pageSize)
        {
            var count = await source.CountAsync();
            var items = await source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PaginatedList<T>(items, count, pageIndex, pageSize);
        }
        #endregion
    }
}
