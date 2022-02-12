import { Component, OnInit, Input, ViewChild, Output, EventEmitter, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { RecipesService } from 'src/services/recipes.service';
import { Recipe } from 'src/models/recipe.model';
//import { ConfirmationService, MessageService } from 'primeng/api'; 
//import { Table } from 'primeng/table'; 
//import { ToastService } from 'src/services/toast.service'; 
//import { PermissionGroupService } from 'src/services/permissionGroup.service'; 
//import { UserSessionService } from 'src/services/userSession.service'; 
//import { RequestResponse } from 'src/models/RequestResponse'; 
//import { PagingData } from 'src/models/PagingData'; 
//import { WhereClauseCriteria, WhereClauseCriteriaCollection } from 'src/models/WhereClauseCriteria'; 
//import { AndOr, DbType, Group, SqlComparison } from 'src/models/enumerations'; 

 
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
    private recipeService: RecipesService) {
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
      //console.log(this.recipe);
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
 
