import { Component, OnInit, Input, ViewChild, Output, EventEmitter, AfterViewInit, ViewEncapsulation } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { RecipesService } from 'src/services/recipes.service';
import { HomePageState } from 'src/services/home.state';
 
@Component({    
    selector: 'home-root', 
    templateUrl: './home.component.html', 
    styleUrls: ['./home.component.scss'] 
}) 
export class homeComponent implements OnInit, AfterViewInit { 
  // #region Properties

  // used for showing/hiding spinner, progress bar or skeleton.
  loadingPage: boolean = false;
  
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

  /**
   * Occurs upon component initialization
   */
  async ngOnInit(): Promise<void> { 
    // obtain data for the page 
    this.getData();
  } 
 
  /**
  * Occurs after view initialization
  */ 
  ngAfterViewInit(): void { 
    // allow ngAfterViewInit() to complete before setting control states
    // otherwise a non-fatal exception is thrown
    setTimeout(() => {
      this.setControlStates();
    }, 10);
  } 
 
  /**
   * Sets control states based upon permissions/current data values.
   */
  setControlStates() {
    // Remove this in the future
    //this.toastService.showWarning('Page is under construction. No data will be returned.');
  }

  // #endregion

  // #region Data Acquisition 

  /** 
   * Retrieves all necessary data for this component. 
   */ 
  async getData() { 
    // start the progress bar/spinner or display a skeleton.
    this.loadingPage = true; 
 
    try {      
      this.homePageState.recipes = await this.recipeService.GetRecipes(this.homePageState);
      //console.log(this.Recipes);

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

  /**
   * Retrieves data applying any sorting and filtering, and scrolls the
   * list to its previous horizontal scroll position.
   */
  async refreshData() {
    // Uncomment the following if you are using a p-table control identified by #dataTableId to render data that includes a paginator.
    //this.currentHScrollPos = this.dataTable.scrollableViewChild.scrollBodyViewChild.nativeElement.scrollLeft;
    //await this.getData(this.webAPI.paging.currentPage);
    //setTimeout(() => {
    //  this.dataTable.scrollableViewChild.scrollBodyViewChild.nativeElement.scrollLeft = this.currentHScrollPos;
    //}, 10);
  }

  // #endregion

  // #region Methods

  // #endregion

  // #region Event Handlers 

  // #endregion
} 
 
