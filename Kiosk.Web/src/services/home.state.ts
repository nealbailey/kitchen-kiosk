//-----------------------------------------------------------------------
// Source File:  "home.state.ts"
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
import { PagingData } from "src/models/PagingData";
import { Recipe } from "src/models/recipe.model";

export class HomePageState {

  //#region Properties

  /** Components are retrieving data */
  public pageIsLoading: boolean = false;

  /** All the recipes that the user has access to */
  public recipes: Recipe[] = [];

  /** The search criteria */
  public searchString: string = '';

  /** The recipe fetch criteria */
  public pagingData: PagingData;

  //#endregion

  //#region Constructor
  /** Constructor */
  public HomePageState() {
    this.pagingData = new PagingData();
  }
  //#endregion
}
