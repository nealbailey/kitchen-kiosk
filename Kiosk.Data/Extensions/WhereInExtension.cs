//-----------------------------------------------------------------------
// Source File:  "WhereInExtension.cs"
// Create Date:  02/08/2022 05:33:00 AM
// Last Updated: 02/08/2022 05:33:00 AM
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
namespace Kiosk.Data.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;

    /// <summary>
    /// Exposes a fluentApi WhereIn clause
    /// </summary>
    public static class WhereInExtension
    {
        /// <summary>
        /// FluentApi WhereIn clause
        /// </summary>
        /// <typeparam name="T1"></typeparam>
        /// <typeparam name="T2"></typeparam>
        /// <param name="table"></param>
        /// <param name="container"></param>
        /// <param name="converter"></param>
        /// <returns></returns>
        public static IEnumerable<T1> WhereIn<T1, T2>(this IEnumerable<T1> table, IEnumerable<T2> container, Func<T1, T2> converter)
        {
            return from b in table where container.Contains(converter(b)) select b;
        }
    }
}
