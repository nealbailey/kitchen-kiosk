//-----------------------------------------------------------------------
// Source File:  "PagingData.ts"
// Create Date:  02/04/2021 10:18:00 PM
// Last Updated: 02/11/2022 10:35:00 AM
// Authors(s):   Neal Bailey <neal.bailey@focusitinc.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: FocusIT, inc
// Software Rights Holder: FocusIT, inc
//-----------------------------------------------------------------------
// The licensee's rights to use, modify, reproduce, release, perform,
// display, or disclose this technical data/computer software are
// restricted by US patent copyright protections. any reproduction
// of this technical data/computer software or portions thereof marked
// with this legend must also reproduce the all original markings.
//-----------------------------------------------------------------------
// Copyright (c) 2012-2022 Baileysoft Solutions.
//-----------------------------------------------------------------------
/**
* PagingData abstraction
*/
export class PagingData {   

  public sortColumn: string = 'date';
  public sortOrder: string = 'desc';
  public searchString: string = '';
  public pageSize: number = 10;
  public pageNumber: number = 1;
  public categoryId: number = 0;

  /**
  * Constructor - all parameters are optional.
  * Only passed parameters are assigned to their corresponding property.
  * 
  * @param pageNumber The current page number.
  * @param pageSize The current page size.
  * @param searchString Search filter.
  * @param sortOrder The current order.
  * @param sortColumn The search column.
  * @param categoryId The filtered category.
  */
  constructor(
    pageNumber?: number,
    pageSize?: number,
    searchString?: string,
    sortOrder?: string,
    sortColumn?: string,
    categoryId?: number) {
    if ((pageNumber !== undefined) && (pageNumber !== null)) this.pageNumber = pageNumber;
    if ((pageSize !== undefined) && (pageSize !== null)) this.pageSize = pageSize;
    if ((searchString !== undefined) && (searchString !== null)) this.searchString = searchString;    
    if ((sortOrder !== undefined) && (sortOrder !== null)) this.sortOrder = sortOrder;
    if ((sortColumn !== undefined) && (sortColumn !== null)) this.sortColumn = sortColumn;
    if ((categoryId !== undefined) && (categoryId !== null)) this.categoryId = categoryId;
  }

  /** Create query-string parameters */
  public CreateQueryString() {
    let q = '?';
    if (this.searchString)
      q += "searchString=" + this.searchString + '&';
    if (this.sortColumn)
      q += "sortcolumn=" + this.sortColumn + '&';
    if (this.sortOrder)
      q += "sortorder=" + this.sortOrder + '&';
    if (this.pageNumber > 0)
      q += "pagenumber=" + this.pageNumber + '&';
    if (this.pageSize > 0)
      q += "pagesize=" + this.pageSize + '&';
    if (this.categoryId > 0)
      q += "categoryId=" + this.categoryId + '&';

    return q;
  }
}
