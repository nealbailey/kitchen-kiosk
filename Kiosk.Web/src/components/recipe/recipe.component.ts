//-----------------------------------------------------------------------
// Source File:  "recipe.component.ts"
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
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatHelper } from 'src/helpers/format.helper';
import { Recipe } from 'src/models/recipe.model';
import { RecipesService } from 'src/services/recipes.service';
import { HomePageState } from 'src/services/home.state';
 
@Component({ 
    encapsulation: ViewEncapsulation.None, 
    selector: 'recipe-root', 
    templateUrl: './recipe.component.html', 
    styleUrls: ['./recipe.component.scss'] 
}) 
export class recipeComponent implements OnInit, AfterViewInit { 
  recipe: Recipe;
 
  // #region Properties
  // used for showing/hiding spinner, progress bar or skeleton.
  loadingPage: boolean = false; 
  // #endregion

  // #region Constructor
  /** 
   * Constructor 
   * @param http HTTPClient required to call actions in any .ts file in the services folder. 
   * @param confirmationService ConfirmationService required for <p-confirmDialog>.
   * @param messageService MessageService required for <p-toast>.
   * @param toastService Common <p-toast> display methods.
   * @param permissionGroupService Service for working with permission groups.
   * @param userSessionService Service for user session information.
   */ 
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipesService,
    public homePageState: HomePageState) {
    this.recipe = new Recipe();
  }
  // #endregion
 
  // #region Component Initialization 

  /** Occurs upon component initialization */
  async ngOnInit(): Promise<void> { 
    // obtain data for the page 
    this.getData();
  } 
 
  /** Occurs after view initialization */ 
  ngAfterViewInit(): void { 
    // allow ngAfterViewInit() to complete before setting control states
    // otherwise a non-fatal exception is thrown
    setTimeout(() => {
      this.setControlStates();
    }, 10);
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
    this.loadingPage = true;

    try {
      this.recipe = await this.recipeService.GetRecipe(
        +this.route.snapshot.params['id']);

      console.log(this.router.url);

      // when data is retrieved, set this.loadingPage to false.
      this.loadingPage = false;

    } catch (message: any) {
      console.log(message);
      this.loadingPage = false;
    }

    // REMOVE this when acquiring data via a Web API call. 
    this.loadingPage = false;
  }

  // #endregion
 
  // #region Methods
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
  */
  async onCategoryClicked(categoryId: number, categoryName) {
    if (categoryId > 0) {
      if (this.homePageState.pagingData.categoryId != categoryId) {
        this.homePageState.pagingData.categoryId = categoryId;
        this.homePageState.pagingData.category = categoryName;
      }
    }
  }
  // #endregion
} 
 
