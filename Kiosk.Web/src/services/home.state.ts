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
import { Category } from "../models/category.model";
import { User } from "../models/user.model";
import { UserSession } from "../models/userSession.model";

export class HomePageState {

  //#region Properties

  /** Components are retrieving data */
  public pageIsLoading: boolean = false;

  /** Search bar is visible on home page component */
  public searchBarIsVisible: boolean = false;

  /** All the recipes that the user has access to */
  public recipes: Recipe[] = [];

  /** Recipe being edited/created */
  public selectedRecipe: Recipe = new Recipe();

  /** All the categories */
  public categories: Category[] = [];

  /** The currently selected category */
  public selectedCategory: Category = new Category();

  /** All the users */
  public users: User[] = [];

  /** The search criteria */
  public searchString: string = '';

  /** The recipe fetch criteria */
  public pagingData: PagingData = new PagingData();

  /** The user session */
  public userSession: UserSession = new UserSession();

  /** Indicates if the create wizard is visible on the screen */
  public createRecipeDialogIsVisible: boolean = false;

  /** The current position of the wizard */
  public createRecipeDialogCurrentStep: number = 1;
  
  //#endregion

  //#region Constructor
  /** Constructor */
  public HomePageState() {
    this.pagingData = new PagingData();
  }
  //#endregion

  //#region Methods

  //#endregion
}
