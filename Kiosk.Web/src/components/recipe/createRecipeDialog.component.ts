import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HomePageState } from 'src/services/home.state';
import { StateValidator } from 'src/services/stateValidator.service';
import { ToastService } from 'src/services/toast.service';

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
    private stateValidator: StateValidator,
    private toastService: ToastService
    ) { 
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
    //console.log(this.homePageState.categories); 
  }

  // #endregion 

  // #region Methods

  // #endregion

  // #region Event Handlers 

  // #endregion
} 
 
