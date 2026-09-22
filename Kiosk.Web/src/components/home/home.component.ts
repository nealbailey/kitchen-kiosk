//-----------------------------------------------------------------------
// Source File:  "home.component.ts"
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
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { formatHelper } from 'src/helpers/format.helper';
import { Ingredient } from 'src/models/ingredient.model';
import { Recipe } from 'src/models/recipe.model';
import { Category } from 'src/models/category.model';
import { CategoriesService } from 'src/services/categories.service';
import { HomePageState } from 'src/services/home.state';
import { RecipesService } from 'src/services/recipes.service';
import { ToastService } from 'src/services/toast.service';
import { UserSessionService } from 'src/services/userSession.service';
import { StateValidator } from 'src/services/stateValidator.service';
 
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'home-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class homeComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  // #region Properties
  @ViewChild('infiniteScrollTrigger') infiniteScrollTrigger: ElementRef;

  private infiniteScrollObserver: IntersectionObserver;
  private viewInitialized: boolean = false;

  /** Recipe count last observed, used to detect data changes made outside this component (e.g. sidebar filters). */
  private lastObservedRecipeCount: number = -1;
  // #endregion

  // #region Constructor
  /** 
   * Constructor 
   * @param homePageState the shared application state service.
   * @param userSessionService service required to work with user sessions.
   * @param stateValidator service for validating user input.   
   * @param recipeService the recipe Http service.
   * @param categoriesService service required for working with categories.
   * @param toastService service for dispatching toast notices.
   * @param confirmationService service for dispatching comfirm dialogs.
   */ 
  constructor(
    public homePageState: HomePageState,    
    public userSessionService: UserSessionService,
    private stateValidator: StateValidator,
    private recipeService: RecipesService,
    private categoriesService: CategoriesService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService) {
  }
  // #endregion
 
  // #region Component Initialization 

  /** Occurs upon component initialization */
  async ngOnInit(): Promise<void> { 
    if (!this.homePageState.recipesInitialized)
      await this.getData();

    console.log('homeComponent:ngOnInit()');
  } 
 
  /** Occurs after view initialization */ 
  ngAfterViewInit(): void { 
    this.viewInitialized = true;

    // allow ngAfterViewInit() to complete before setting control states
    // otherwise a non-fatal exception is thrown
    setTimeout(() => {
      this.setControlStates();
    }, 10);

    if (this.homePageState.recipesInitialized)
      this.restoreScrollPosition();

    console.log('homeComponent:ngAfterViewInit()');
  }

  /** Re-arms the scroll observer whenever the recipe count changes, since the card grid may not
   *  leave the sentinel's viewport visibility state each time (sidebar filters bypass this component). */
  ngAfterViewChecked(): void {
    if (!this.viewInitialized || !this.infiniteScrollTrigger)
      return;

    const currentRecipeCount = this.homePageState.recipes.length;

    if (currentRecipeCount !== this.lastObservedRecipeCount) {
      this.lastObservedRecipeCount = currentRecipeCount;
      this.reattachInfiniteScrollObserver();
    }
  }

  /** Saves the list position and releases the scroll observer. */
  ngOnDestroy(): void {
    this.homePageState.scrollPosition = window.scrollY;
    this.infiniteScrollObserver?.disconnect();
  }
 
  /** Sets control states based upon permissions/current data values. */
  setControlStates() {
    // Remove this in the future
    //this.toastService.showWarning('Page is under construction. No data will be returned.');
  }

  // #endregion

  // #region Data Acquisition 

  /** Retrieves all necessary data for this component. */ 
  async getData(append: boolean = false): Promise<boolean> {
    if (!append)
      this.homePageState.pageIsLoading = true;
 
    try {
      const recipes = await this.recipeService.GetRecipes(this.homePageState);

      if (append)
        this.homePageState.appendRecipes(recipes);
      else
        this.homePageState.setRecipes(recipes);

      return true;
    } catch (message: any) {
      this.toastService.showError(message);
      return false;
    }
    finally {
      this.homePageState.pageIsLoading = false;
      this.homePageState.isLoadingMoreRecipes = false;

      if (this.viewInitialized && this.homePageState.recipesInitialized)
        this.initializeInfiniteScroll();
    }
  }

  // #endregion
 
  // #region Methods

  /** Observes a marker below the list and loads another page as it approaches. */
  private initializeInfiniteScroll() {
    if (this.infiniteScrollObserver || !this.infiniteScrollTrigger)
      return;

    this.lastObservedRecipeCount = this.homePageState.recipes.length;
    this.reattachInfiniteScrollObserver();
  }

  /** Recreates the observer so it re-evaluates the sentinel's current visibility.
   *  IntersectionObserver only reports visibility *changes*, so a fresh instance is required to detect
   *  "still visible after the list shrank/grew" cases that a persistent observer would silently miss. */
  private reattachInfiniteScrollObserver() {
    if (!this.infiniteScrollTrigger)
      return;

    this.infiniteScrollObserver?.disconnect();

    this.infiniteScrollObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting))
        this.loadNextPage();
    }, { rootMargin: '200px 0px' });

    this.infiniteScrollObserver.observe(this.infiniteScrollTrigger.nativeElement);
  }

  /** Restores the home list after its existing records have rendered. */
  private restoreScrollPosition() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, this.homePageState.scrollPosition);
        this.initializeInfiniteScroll();
      });
    });
  }

  /** Fetches and appends the next recipe page. */
  async loadNextPage() {
    if (this.homePageState.pageIsLoading ||
        this.homePageState.isLoadingMoreRecipes ||
        !this.homePageState.hasMoreRecipes)
      return;

    const previousPage = this.homePageState.pagingData.pageNumber;
    this.homePageState.pagingData.pageNumber = previousPage + 1;
    this.homePageState.isLoadingMoreRecipes = true;

    if (!await this.getData(true))
      this.homePageState.pagingData.pageNumber = previousPage;
  }

  /** Saves the current list position before opening a recipe. */
  onRecipeClicked() {
    this.homePageState.scrollPosition = window.scrollY;
  }

  /**
  * Deletes the selected recipe
  * @param recipeId the recipe id of the record to delete.
  */
  async DeleteRecipe(recipeId: number) {
    try {
      this.homePageState.pageIsLoading = true;      
      await this.recipeService.DeleteRecipe(recipeId);
      this.toastService.showSuccess('Recipe deleted successfully');
      this.homePageState.resetRecipes();
      await this.getData();
    }
    catch (e) {
      this.homePageState.pageIsLoading = false;
      this.toastService.showError('Error: ' + e);
      console.log(e);
    }
    finally {
      this.homePageState.pageIsLoading = false;
    }
  }

  /**
  * Converts date string from the database to a friendly date, optionally including the time
  * @param the_date the date you need to convert 
  * @param includeTime whether to include the time portion (default false)
  */
  public getLocalDateString(the_date: any, includeTime: boolean = false) {
    return new formatHelper().getLocalDateString(the_date, includeTime);
  }
  // #endregion

  // #region Event Handlers

  /**
  * User entered a search word
  * @param input
  */
  async searchEntered(input: any) {
    if (!input)
      return;

    this.homePageState.pagingData.searchString = input.value;

    // if (input.value.length == 0) {
    //   this.homePageState.resetRecipes();
    //   await this.getData();
    //   window.scrollTo(0, 0);
    //   return;
    // }

    if (input.value.length < 4)
      return;

    // Give some time before triggering AJAX calls
    setTimeout(() => {
      console.log("Search: " + input.value)
    }, 1250);

    this.homePageState.resetRecipes();
    await this.getData();
    window.scrollTo(0, 0);
  }

  /**
   * User clicked the search button - Show/Hide homepage search bar
   */
  async onSearchClicked() {
    this.homePageState.searchBarIsVisible = !this.homePageState.searchBarIsVisible;
  }

  /**
   * User selected a category
   * @param categoryId the category id (catId)
   * @param categoryName the category friendly name
   */
  async onCategoryClicked(categoryId: number, categoryName: string) {
    if (categoryId > 0) {
      if (this.homePageState.pagingData.categoryId != categoryId) {
        this.homePageState.pagingData.categoryId = categoryId;
        this.homePageState.pagingData.category = categoryName;
        this.homePageState.resetRecipes();
        await this.getData();

        window.scrollTo(0, 0);
      }
    }
  }

  /**
  * User selected a user
  * @param id the user id (guid)
  * @param userName the friendly user name
  */
  async onUserClicked(id: string, userName: string) {
    if (id) {
      if (this.homePageState.pagingData.userId != id) {
        this.homePageState.pagingData.userId = id;
        this.homePageState.pagingData.userName = userName;
        this.homePageState.resetRecipes();
        await this.getData();

        window.scrollTo(0, 0);
      }
    }
  }

  /**
   * User clicked the Delete button on a recipe record
   * @param recipeId the id of the record to delete
   */
  async onRecipeDeleteClicked(recipeId: number) {    
    this.confirmationService.confirm({
      message: '&nbsp;Are you sure you want to delete this recipe?&nbsp;&nbsp;&nbsp;<br/>&nbsp;This delete action cannot be undone.&nbsp;&nbsp;&nbsp;',
      accept: () => {
        this.confirmationService.close();
        this.DeleteRecipe(recipeId);
      }
    });
    return;    
  }

  /**
   * User clicked the Edit recipe button
   * @param recipe the selected recipe
   */
  async onRecipeEditClicked(recipe: Recipe) {
    if (this.homePageState.categories.length == 0)
      this.homePageState.categories = await this.categoriesService.GetCategories();

    if (!recipe.ingredients || recipe.ingredients.length == 0) {
      recipe.ingredients = await this.recipeService.GetRecipeIngredients(recipe.recId);      
    }      

    this.homePageState.selectedRecipe = recipe;
    this.homePageState.selectedRecipe.instructions = recipe.instructions.split("<br />").join("\n");
    this.homePageState.selectedRecipe.strIngredients = recipe.ingredients.map(o => o.ingredient).join("\n");
    this.homePageState.selectedRecipe.primaryCategory =
      this.homePageState.categories.find(
        x => x.catId === this.homePageState.selectedRecipe.primaryCategory.catId);

    this.homePageState.createRecipeDialogCurrentStep = 1;
    this.homePageState.createRecipeDialogIsVisible = true;
  }

  /**
   * User clicked the favorite button
   * @param recipe the recipe clicked
   */
  async onRecipeFavoriteClicked(recipe: Recipe) {
    let btnState = recipe.isFavorite;
    recipe.isFavorite = !recipe.isFavorite;

    switch (btnState) {
      case true: await this.recipeService.RemoveRecipeAsFavorite(recipe.recId); break;
      case false: await this.recipeService.SetRecipeAsFavorite(recipe); break;
    }
  }

  /**
  * User removed a chip
  * @param id the chip html id 
  */
  async onRemoveChip(id: string) {
    console.log(id);
    switch (id) {
      case 'chipSearch':
        this.homePageState.pagingData.searchString = '';
        break;
      case 'chipCategory':
        this.homePageState.pagingData.categoryId = 0;
        this.homePageState.pagingData.category = '';
        this.homePageState.selectedCategory = new Category();
        break;
      case 'chipUser':
        this.homePageState.pagingData.userId = '';
        this.homePageState.pagingData.userName = '';
        break;
      case 'chipFavorites':
        this.homePageState.pagingData.favoritesOnly = false;
        break;
    }
    this.homePageState.resetRecipes();
    await this.getData();
    window.scrollTo(0, 0);
  }

  //#region Create Dialog

  /** Called when the user clicks the 'Next' button in the create dialog */
  async onCreateRecipeDialogNextClicked() {
    let isValid = await this.stateValidator.validateCreateRecipeSteps();

    if (this.stateValidator.errors.length > 0)
      this.toastService.showError(this.stateValidator.errors.join('\r\n'));

    if (!isValid)
      return;    

    let stepNum: number = this.homePageState.createRecipeDialogCurrentStep;
    if (stepNum === 3)
      return;

    let nextStep = ++this.homePageState.createRecipeDialogCurrentStep;
    this.homePageState.createRecipeDialogCurrentStep = nextStep;
  }

  /** Called when the user clicks the 'Previous' button in the create dialog */
  onCreateRecipeDialogPrevClicked() {
    let stepNum: number = this.homePageState.createRecipeDialogCurrentStep;
    if (stepNum === 1)
      return;

    let nextStep = --this.homePageState.createRecipeDialogCurrentStep;
    this.homePageState.createRecipeDialogCurrentStep = nextStep;
  }

  /** User clicked 'Save' button in create dialog */
  async onCreateRecipeSaveClicked() {

    if (!this.stateValidator.validateCreateRecipeSteps())
      return;

    // Populate ingredient array
    var i = this.homePageState.selectedRecipe.strIngredients.split("\n");
    if (i.length > 0) {
      this.homePageState.selectedRecipe.ingredients = [];
      for (var x in i) {
        if (i[x])
          this.homePageState.selectedRecipe.ingredients.push(new Ingredient(0, i[x]));
      }
    }    

    try {
      this.homePageState.createRecipeDialogIsVisible = false;
      if (!this.homePageState.selectedRecipe.recId) {
        this.homePageState.pageIsLoading = true;
        await this.recipeService.CreateRecipe(this.homePageState.selectedRecipe);
        this.toastService.showSuccess('Recipe created successfully');
      }
      else {
        this.homePageState.pageIsLoading = true;
        await this.recipeService.UpdateRecipe(this.homePageState.selectedRecipe);
        this.toastService.showSuccess('Recipe updated successfully');
      }
      this.homePageState.resetRecipes();
      await this.getData();
    } catch (message: any) {
      this.toastService.showError(message);
    }
    finally {
      this.homePageState.pageIsLoading = false;
    }
  }

  //#endregion

  // #endregion
} 
 
