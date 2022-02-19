//-----------------------------------------------------------------------
// Source File:  "topnav.component.ts"
// Create Date:  02/15/2022 10:10:00 AM
// Last Updated: 02/16/2022 10:35:00 AM
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
import { UserSession } from 'src/models/userSession.model';
import { HomePageState } from 'src/services/home.state';
import { LoginService } from 'src/services/login.service';
import { ToastService } from 'src/services/toast.service';
import { UserSessionService } from 'src/services/userSession.service';
import { Recipe } from '../../models/recipe.model';
import { CategoriesService } from '../../services/categories.service';

@Component({ 
    encapsulation: ViewEncapsulation.None, 
    selector: 'topnav-root', 
    templateUrl: './topnav.component.html', 
    styleUrls: ['./topnav.component.scss'] 
}) 
export class topnavComponent implements OnInit, AfterViewInit { 

  //#region Directives
  //#endregion

  //#region Properties
  username: string = '';
  password: string = '';
  //#endregion

  // #region Constructor
  /** Constructor */ 
  constructor(
    public homePageState: HomePageState,
    private loginService: LoginService,
    private userSessionService: UserSessionService,
    private toastService: ToastService,
    private categoriesService: CategoriesService) {
    if (!this.homePageState.userSession)
      this.homePageState.userSession = new UserSession();
  }
  // #endregion
 
  // #region Component Initialization 

  /** Occurs upon component initialization */
  async ngOnInit(): Promise<void> { 
    await this.getData();
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
    // Get user token
    this.homePageState.userSession = this.userSessionService.getUserSession();
  }

  // #endregion

  // #region Methods
  // #endregion

  // #region Event Handlers

  async onCreateRecipeClicked() {
    this.homePageState.categories = await this.categoriesService.GetCategories();
    this.homePageState.selectedRecipe = new Recipe();
    this.homePageState.selectedRecipe.useruid = this.userSessionService.getUserSession().id;
    //console.log(this.homePageState.categories);
    this.homePageState.createRecipeDialogCurrentStep = 1;
    this.homePageState.createRecipeDialogIsVisible = true;
  }

  /**
   * User clicked the Login button
   * @param event the event args associated with the event
   */
  async onLoginClicked(event: any) {
    if (!this.homePageState.userSession)
      this.homePageState.userSession = new UserSession();
        
    // Any attempt to login must clear any previously existing bearer-token
    localStorage.setItem('token', JSON.stringify(this.homePageState.userSession));

    try {
      // get token
      this.homePageState.userSession.username = this.username;
      this.homePageState.userSession.password = this.password;
      await this.loginService.loginWithUserPass(this.homePageState.userSession);
      console.log("access_token=" + this.homePageState.userSession.token);

      if (this.homePageState.userSession.token) {
        // (onSuccessfulLogin)="onSuccessfulLogin($event)" MUST be added to the login-root
        // (this) component's HTML tag to indicate that the onSuccessfulLogin event is being emitted.
        // The Application component (direct parent of this component) implements the onSuccessfulLogin() method
        // that receives and processes the event.
        //this.onSuccessfulLogin.emit();
      }
    }
    catch (strError) {
      this.homePageState.userSession = null;
      this.toastService.showError(strError);
    }
  }

  /** User clicked 'Sign Out' button */
  async onLogoutClicked() {
    await this.userSessionService.logOutUser();
    this.homePageState.userSession = new UserSession();
  }
  // #endregion
} 
 
