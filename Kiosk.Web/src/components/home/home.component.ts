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
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { formatHelper } from 'src/helpers/format.helper';
import { HomePageState } from 'src/services/home.state';
import { RecipesService } from 'src/services/recipes.service';
 
@Component({    
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
   * @param recipeService the recipe Http service.
   */ 
  constructor(
    public homePageState: HomePageState,
    private recipeService: RecipesService) { 
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
      console.log('categoryId (getData) = ' + this.homePageState.pagingData.categoryId);
      this.homePageState.recipes = await this.recipeService.GetRecipes(this.homePageState);

      // when data is retrieved, set this.loadingPage to false.
      this.homePageState.pageIsLoading = false;

    } catch (message: any) {
      console.log(message);
      this.homePageState.pageIsLoading = false;
    }

    // REMOVE this when acquiring data via a Web API call. 
    this.homePageState.pageIsLoading = false;
  }

  // #endregion
 
  // #region Paging Support

  /**
   * Selected page changed in the paginator
   * @param event
   */
  onPageChanged(event) {
    // Uncomment the following if you are using a p-table control identified by #dataTableId to render data that includes a paginator.
    //if (PagingData.onPageChanged(this.webAPI.paging, event, this.dataTable)) {
    //  this.refreshData();
    //}
  }

  /**
   *  Goes to the user entered page.
   */
  onGotoPage() {
    // Uncomment the following if you are using a p-table control identified by #dataTableId to render data that includes a paginator.
    //if (PagingData.onGotoPage(this.webAPI.paging, this.dataTable)) {
    //  this.refreshData();
    //}
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
        await this.getData();

        window.scrollTo(0, 0);
      }
    }
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
  // #endregion
} 
 
