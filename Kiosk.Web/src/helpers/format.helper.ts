//-----------------------------------------------------------------------
// Source File:  "format.helper.ts"
// Create Date:  02/04/2021 10:18:00 PM
// Last Updated: 02/11/2022 10:35:00 AM
// Authors(s):   Neal Bailey <nealbailey@hotmail.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: Neal Bailey
// Software Rights Holder: Neal Bailey
//-----------------------------------------------------------------------
// The licensee's rights to use, modify, reproduce, release, perform,
// display, or disclose this technical data/computer software are
// restricted by US patent copyright protections. any reproduction
// of this technical data/computer software or portions thereof marked
// with this legend must also reproduce the all original markings.
//-----------------------------------------------------------------------
// Copyright (c) 2012-2022 Baileysoft Solutions.
//-----------------------------------------------------------------------

/** Helper functions relating to data formatting */
export class formatHelper {

  /**
  * Converts date string from the database to a friendly date, optionally including the time
  * @param the_date the date you need to convert 
  * @param includeTime whether to include the time portion (default false)
  */
  public getLocalDateString(the_date: any, includeTime: boolean = false) {
    if ((the_date == undefined) || (the_date == null))
      return the_date;

    // Is this even a date?
    var regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d+/;
    if (!regex.test(the_date)) {
      return the_date;
    }

    const date = new Date(the_date);
    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
  }

}
