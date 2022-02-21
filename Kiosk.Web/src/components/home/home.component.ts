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
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { formatHelper } from 'src/helpers/format.helper';
import { Ingredient } from 'src/models/ingredient.model';
import { Recipe } from 'src/models/recipe.model';
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
export class homeComponent implements OnInit, AfterViewInit {

  // #region Properties
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
    // obtain data for the page 
    this.getData();

    console.log('homeComponent:ngOnInit()');
  } 
 
  /** Occurs after view initialization */ 
  ngAfterViewInit(): void { 
    // allow ngAfterViewInit() to complete before setting control states
    // otherwise a non-fatal exception is thrown
    setTimeout(() => {
      this.setControlStates();
    }, 10);
    console.log('homeComponent:ngAfterViewInit()');
  } 
 
  /** Sets control states based upon permissions/current data values. */
  setControlStates() {
    // Remove this in the future
    //this.toastService.showWarning('Page is under construction. No data will be returned.');
  }

  // #endregion

  // #region Data Acquisition 

  /** Retrieves all necessary data for this component. */ 
  async getData() { 
    // start the progress bar/spinner or display a skeleton.
    this.homePageState.pageIsLoading = true;
 
    try {      
      this.homePageState.recipes = await this.recipeService.GetRecipes(this.homePageState);      

      // when data is retrieved, set this.loadingPage to false.
      this.homePageState.pageIsLoading = false;

    } catch (message: any) {
      console.log(message);
      this.homePageState.pageIsLoading = false;
    }
  }

  // #endregion
 
  // #region Methods

  /**
  * Deletes the selected recipe
  * @param recipeId the recipe id of the record to delete.
  */
  async DeleteRecipe(recipeId: number) {
    try {
      this.homePageState.pageIsLoading = true;
      
      await this.recipeService.DeleteRecipe(recipeId);
      this.homePageState.pageIsLoading = false;

      await this.getData();
    }
    catch (e) {
      this.homePageState.pageIsLoading = false;
      this.toastService.showError('Error: ' + e);
      console.log(e);
    }
  }

  /**
  * Converts date string from the database to friendly date-time
  * @param the_date the date you need to convert 
  */
  public getLocalDateString(the_date: any) {
    return new formatHelper().getLocalDateString(the_date);
  }
  // #endregion

  // #region Event Handlers

  /**
   * User selected a category
   * @param categoryId the category id (catId)
   * @param categoryName the category friendly name
   */
  async onCategoryClicked(categoryId: number, categoryName) {
    if (categoryId > 0) {
      if (this.homePageState.pagingData.categoryId != categoryId) {
        this.homePageState.pagingData.pageNumber = 1;
        this.homePageState.pagingData.categoryId = categoryId;
        this.homePageState.pagingData.category = categoryName;        
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
        this.DeleteRecipe(recipeId);
      }
    });
    return;    
  }

  /**
   * User clicked the Edit recipe button
   * @param recipe the selected recipe
   */
  async onEditRecipeClicked(recipe: Recipe) {
    console.log(recipe);

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

  /** User clicked on the Next Page button */
  async onNextPageClicked() {
    this.homePageState.pagingData.pageNumber = (this.homePageState.pagingData.pageNumber + 1);
    await this.getData();
    window.scrollTo(0, 0);
  }

  /** User clicked on the Previous Page button */
  async onPrevPageClicked() {
    if (this.homePageState.pagingData.pageNumber <= 1)
      return;
    this.homePageState.pagingData.pageNumber = (this.homePageState.pagingData.pageNumber -1);
    await this.getData();
    window.scrollTo(0, 0);
  }

  /**
  * User removed a chip
  * @param id the chip html id 
  */
  async onRemoveChip(id) {
    console.log(id);
    switch (id) {
      case 'chipSearch':
        this.homePageState.pagingData.searchString = '';
        break;
      case 'chipCategory':
        this.homePageState.pagingData.categoryId = 0;
        this.homePageState.pagingData.category = '';
        break;
    }
    await this.getData();
  }

  //#region Create Dialog

  /** Called when the user clicks the 'Next' button in the create dialog */
  onCreateRecipeDialogNextClicked() {
    if (!this.stateValidator.validateCreateRecipeSteps())
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
      if (!this.homePageState.selectedRecipe.recId) {
        await this.recipeService.CreateRecipe(this.homePageState.selectedRecipe);
        this.toastService.showSuccess('Recipe created successfully');
      }
      else {
        await this.recipeService.UpdateRecipe(this.homePageState.selectedRecipe);
        this.toastService.showSuccess('Recipe updated successfully');
      }

      this.homePageState.createRecipeDialogIsVisible = false;
      await this.getData();
    } catch (message: any) {
      this.toastService.showError(message);
    }     
  }

  //#endregion

  // #endregion
} 
 
