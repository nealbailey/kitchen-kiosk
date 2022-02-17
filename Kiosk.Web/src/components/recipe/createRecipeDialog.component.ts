import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ToastService } from 'src/services/toast.service';
import { HomePageState } from 'src/services/home.state';

@Component({ 
    encapsulation: ViewEncapsulation.None, 
    selector: 'createRecipeDialog-root', 
    templateUrl: './createRecipeDialog.component.html', 
    styleUrls: ['./createRecipeDialog.component.scss'] 
}) 
export class createRecipeDialogComponent implements OnInit, AfterViewInit { 
  // #region Properties
  // #endregion

  // #region Constructor

  /** 
   * Constructor 
   *  
   * @param http HTTPClient required to call actions in any .ts file in the services folder. 
   * @param confirmationService ConfirmationService required for <p-confirmDialog>.
   * @param messageService MessageService required for <p-toast>.
   * @param toastService Common <p-toast> display methods.
   * @param permissionGroupService Service for working with permission groups.
   * @param userSessionService Service for user session information.
   */ 
  constructor(
    private http: HttpClient,
    public homePageState: HomePageState,
    private toastService: ToastService
    ) { 
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
   * 
   * @param: currentPage - paging support. 
   */ 
  async getData() {
    console.log(this.homePageState.categories);
    // start the progress bar/spinner or display a skeleton.
    //this.loadingPage = true; 
 
    //try {
    //  // code to acquire data via a Web API call.
    //  // returned object is a RequestResponse object.
    //  this.webAPI.data = []; //  Required - Clear data from last request or set your specific controller request data.
    //  this.webAPI.data = JSON.stringify(this.allCriteria);
    //  //this.webAPI.paging.pagingRead = true; // Required for lazy loading of data (default gets all records).

    //  var response = await this.componentSpecificService.getData(this.webAPI);
    //  // assign returned object to class variable.
    //  this.webAPI = response; // Required - do not remove.
    //  // convert the 'data' property of the RequestResponse object's 'data' property JSON string value to an object.
    //  RequestResponse.dataToObject(this.webAPI); // Required - do not remove.

    //  // when data is retrieved, set this.loadingPage to false.
    //  this.loadingPage = false;

    //} catch (message: any) {
    //  this.webAPI.paging.totalRecords = 0;
    //  this.loadingPage = false;
    //  this.toastService.showError(message);
    //}

    // REMOVE this when acquiring data via a Web API call. 
    //this.loadingPage = false; 
  }

  // #endregion 

  // #region Methods

  // #endregion

  // #region Event Handlers 

  // #endregion
} 
 
