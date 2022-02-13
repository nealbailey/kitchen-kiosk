import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PagingData } from 'src/models/PagingData';
import { HomePageState } from 'src/services/home.state';
import { RecipesService } from 'src/services/recipes.service';

@Component({ 
    encapsulation: ViewEncapsulation.None, 
    selector: 'sidebar-root', 
    templateUrl: './sidebar.component.html', 
    styleUrls: ['./sidebar.component.scss'] 
}) 
export class sidebarComponent implements OnInit, AfterViewInit { 
  
  // #region Properties

  // used for showing/hiding spinner, progress bar or skeleton.
  loadingPage: boolean = false; 
  // Standard Request/Response object. Includes Paging support if necessary 
  
  // #endregion

  // #region Constructor

  /** 
   * Constructor 
   * @param router angular router
   * @param recipesService service needed to work with recipes
   * @param homePageState shared application state
   */ 
  constructor(
    private router: Router,
    private recipesService: RecipesService,
    public homePageState: HomePageState) {

    if (!this.homePageState.pagingData)
      this.homePageState.pagingData = new PagingData();
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
    //this.loadingPage = true;

    try {
      this.homePageState.recipes = await this.recipesService.GetRecipes(this.homePageState);
      
      // when data is retrieved, set this.loadingPage to false.
      //this.loadingPage = false;

    } catch (message: any) {
      console.log(message);
      //this.loadingPage = false;
    }

    // REMOVE this when acquiring data via a Web API call. 
    //this.loadingPage = false;
  }

  // #endregion
 
  // #region Methods
  // #endregion

  // #region Event Handlers 

  /**
  * User entered a search word
  * @param input
  */
  async searchEntered(input: any) {
    if (!input)
      return;

    if (input.value.length == 0)
      await this.getData();

    if (input.value.length < 4)
      return;

    // Give some time before triggering AJAX calls
    setTimeout(() => {
      console.log("Search: " + input.value)
    }, 1000);

    // Redirect to home if somewhere else in the system
    if (this.router.url !== '/home') {
      setTimeout(() => {
        this.router.navigateByUrl('/home');        
      }, 500);
    }

    await this.getData();
  }

  // #endregion
} 
 
