//-----------------------------------------------------------------------
// Source File:  "sidebar.component.ts"
// Create Date:  02/04/2021 10:18:00 PM
// Last Updated: 03/09/2022 08:40:00 AM
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
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { PagingData } from 'src/models/PagingData';
import { CategoriesService } from 'src/services/categories.service';
import { HomePageState } from 'src/services/home.state';
import { RecipesService } from 'src/services/recipes.service';
import { UsersService } from 'src/services/users.service';
import { UserSessionService } from 'src/services/userSession.service';

@Component({ 
    encapsulation: ViewEncapsulation.None, 
    selector: 'sidebar-root', 
    templateUrl: './sidebar.component.html', 
    styleUrls: ['./sidebar.component.scss'] 
}) 
export class sidebarComponent implements OnInit, AfterViewInit { 
  
  // #region Properties
  sidebarMenuItems: MenuItem[];
  isLoading: boolean;
  // #endregion

  // #region Constructor

  /** 
   * Constructor 
   * @param router angular router
   * @param categoriesService service needed to work with categories
   * @param recipesService service needed to work with recipes
   * @param homePageState shared application state
   * @param userSessionService service needed to work with user sessions
   * @param confirmationService service for dispatching comfirm dialogs.
   */ 
  constructor(
    private router: Router,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private recipesService: RecipesService,
    public homePageState: HomePageState,
    public userSessionService: UserSessionService,
    private confirmationService: ConfirmationService  ) {

    if (!this.homePageState.pagingData)
      this.homePageState.pagingData = new PagingData();
  }

  // #endregion
 
  // #region Component Initialization 

  /** Occurs upon component initialization */
  async ngOnInit(): Promise<void> { 
    // Recipe data is owned by the routed home component.
    this.getData(false);
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
  async getData(loadRecipes: boolean = true) {
    try {
      this.isLoading = true;
      if (loadRecipes) {
        this.homePageState.pageIsLoading = true;
        const recipes = await this.recipesService.GetRecipes(this.homePageState);
        this.homePageState.setRecipes(recipes);
      }

      if (this.homePageState.categories.length == 0)
        this.homePageState.categories = await this.categoriesService.GetCategories();

      if (this.homePageState.users.length == 0)
        this.homePageState.users = await this.usersService.GetUsers();

      this.getTieredMenu();

    } catch (message: any) {
      console.log(message);
    }
    finally {
      this.isLoading = false;
      if (loadRecipes)
        this.homePageState.pageIsLoading = false;
    }
  }

  // #endregion
 
  // #region Methods

  /** Build the sidebar navigation menu */
  getTieredMenu() {
    let catMenuItems: MenuItem[] = [];
    let userMenuItems: MenuItem[] = [];

    this.homePageState.categories.forEach((category) => {
      catMenuItems.push({
        label: category.category,
        icon: 'pi pi-fw pi-file',
        id: category.catId.toString(),
        command: (event) => { this.onTieredMenuItemClick(event, 'category'); }
      })
    });

    this.homePageState.users.forEach((usr) => {
      userMenuItems.push({
        label: usr.userName,
        icon: 'pi pi-fw pi-user',
        id: usr.id.toString(),
        command: (event) => { this.onTieredMenuItemClick(event, 'user'); }
      })
    });

    //ToDo: Users menu
    this.sidebarMenuItems = [
      {
        label: 'Categories',
        icon: 'pi pi-fw pi-file',
        items: catMenuItems
      },
      {
        label: 'Users',
        icon: 'pi pi-users',
        items: userMenuItems
      }
    ];
  }


  /** Show request access form */
  requestAccess() {
    this.confirmationService.close();
    //ToDo: show access form    
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

    if (input.value.length == 0) {
      this.homePageState.resetRecipes();
      await this.getData();
    }

    if (input.value.length < 4)
      return;

    // Give some time before triggering AJAX calls
    setTimeout(() => {
      console.log("Search: " + input.value)
    }, 1250);

    // Redirect to home if somewhere else in the system
    if (this.router.url !== '/home') {
      setTimeout(() => {
        this.router.navigateByUrl('/home');        
      }, 500);
    }

    this.homePageState.resetRecipes();
    await this.getData();
  }

  /** User clicked the My Favorites link */
  async onFavoritesClicked() {
    this.homePageState.pagingData.favoritesOnly = true;
    this.homePageState.resetRecipes();
    this.homePageState.pageIsLoading = this.isLoading;
    await this.getData();
    this.homePageState.pageIsLoading = this.isLoading;
  }

  /** User clicked the Home link */
  async onHomeClicked() {
    this.homePageState.pagingData.favoritesOnly = false;
    this.homePageState.resetRecipes();
    await this.getData();
  }

  /** User clicked the Request Access button */
  onRequestAccessClicked() {
    this.confirmationService.confirm({
      message: '&nbsp;This site is for a limited private audience.&nbsp;&nbsp;&nbsp;<br/>&nbsp;To request access send an email to nealbailey@hotmail.com&nbsp;&nbsp;&nbsp;',
      accept: () => {
        this.requestAccess();
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
    return;
  }

  /**
  *  Handles the click event of items in tiered menu
  *  @param event the menuitem that was clicked (event.item)
  *  @param type the menu type (category or user)
  */
  async onTieredMenuItemClick(event: any, type: string) {
    this.homePageState.pageIsLoading = this.isLoading;
    if (type == 'category') {
      this.homePageState.pagingData.categoryId = event.item.id;
      this.homePageState.pagingData.category = event.item.label;
      this.homePageState.resetRecipes();
      await this.getData();
    }

    if (type == 'user') {
      this.homePageState.pagingData.userId = event.item.id;
      this.homePageState.pagingData.userName = event.item.label;
      this.homePageState.resetRecipes();
      await this.getData();
    }
    this.homePageState.pageIsLoading = this.isLoading;
  }

  // #endregion

}

