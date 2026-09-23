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

  /** The recipe collection has been loaded at least once */
  public recipesInitialized: boolean = false;

  /** More recipe pages may be available */
  public hasMoreRecipes: boolean = true;

  /** The next recipe page is currently being loaded */
  public isLoadingMoreRecipes: boolean = false;

  /** The home page's last vertical scroll position */
  public scrollPosition: number = 0;

  /** Recipe being edited/created */
  public selectedRecipe: Recipe = new Recipe();

  /** All the categories */
  public categories: Category[] = [];

  /** The currently selected category */
  public selectedCategory: Category = new Category();

  /** All the users */
  public users: User[] = [];

  /** The currently selected author/user filter */
  public selectedUser: User = new User();

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

  /** Clears the recipe collection before applying new filters or refreshing it. */
  public resetRecipes() {
    this.recipes = [];
    this.pagingData.pageNumber = 1;
    this.recipesInitialized = false;
    this.hasMoreRecipes = true;
    this.isLoadingMoreRecipes = false;
    this.scrollPosition = 0;
  }

  /** Replaces the current recipe collection with a fetched page. */
  public setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.recipesInitialized = true;
    this.hasMoreRecipes = recipes.length >= this.pagingData.pageSize;
  }

  /** Adds a fetched page to the current recipe collection. */
  public appendRecipes(recipes: Recipe[]) {
    const existingIds = new Set(this.recipes.map(recipe => recipe.recId));
    this.recipes = this.recipes.concat(
      recipes.filter(recipe => !existingIds.has(recipe.recId)));
    this.recipesInitialized = true;
    this.hasMoreRecipes = recipes.length >= this.pagingData.pageSize;
  }

  //#endregion
}
