//-----------------------------------------------------------------------
// Source File:  "AppSettings.ts"
// Create Date:  02/04/2021 10:18:00 PM
// Last Updated: 09/25/2022 11:24:00 PM
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

/** Shape of the external, deployable src/assets/config/app-settings.json file. */
export interface AppSettingsConfig {
  API_URL?: string;
  API_LOGIN_ENDPOINT?: string;
  API_CREATE_USER?: string;
  API_DELETE_USER?: string;
  API_CHANGE_PASSWORD?: string;
  API_CATEGORIES?: string;
  API_CREATE_CATEGORY?: string;
  API_DELETE_CATEGORY?: string;
  API_USERS?: string;
  API_RECIPES?: string;
  API_RECIPE?: string;
  API_RECIPE_INGREDIENTS?: string;
  API_RECIPE_PHOTOS?: string;
}

/** Public shared global constant string literals. */
export class AppSettings {

  // #region Constants
  readonly CLOUD_URL    = 'https://kiosk-data.azurewebsites.net'; //Azure
  readonly DEVL_WIN_URL = 'https://localhost:44389'; //Windows
  readonly DEVL_LIN_URL = 'http://localhost:5000'; //Linux
  readonly APACHE_URL   = 'https://localhost/kioskapi'; //Apache
  //readonly APACHE_URL = 'http://localhost:5000'; //Apache  
  //readonly APACHE_URL = 'http://baileyfs02.baileysoft.lan:8001'; //Apache
  //readonly APACHE_URL_2 = 'http://192.168.2.1:8001'; //Apache
  
  // #endregion

  // #region Properties
  // #endregion

  // #region Properties (Static)

  /** WebAPI remote url. */
  public static API_URL: string;

  /** Controller endpoint for generating a bearer token. */
  public static API_LOGIN_ENDPOINT: string;

  /** Controller endpoint for creating a new user. */
  public static API_CREATE_USER: string;

  /** Controller endpoint for deleting a user. */
  public static API_DELETE_USER: string;

  /** Controller endpoint for changing a user's password. */
  public static API_CHANGE_PASSWORD: string;

  /** Controller endpoint for fetching categories. */
  public static API_CATEGORIES: string;

  /** Controller endpoint for creating a new category. */
  public static API_CREATE_CATEGORY: string;

  /** Controller endpoint for deleting a category. */
  public static API_DELETE_CATEGORY: string;

  /** Controller endpoint for fetching users. */
  public static API_USERS: string;

  /** Controller endpoint for fetching recipes. */
  public static API_RECIPES: string;

  /** Controller endpoint for a single recipe. */
  public static API_RECIPE: string;

  /** Controller endpoint for a recipe ingredients. */
  public static API_RECIPE_INGREDIENTS: string;

  /** Controller endpoint for fetching photos of a recipe. */
  public static API_RECIPE_PHOTOS: string;

  // #endregion

  // #region Methods

  /**
   * Initialize the static settings/endpoints. Called once at app bootstrap
   * (see main.ts) after the external app-settings.json config has been loaded.
   * Any blank/missing value in the config falls back to the built-in default.
   * @param config Overrides from the external config file, if any.
   */
  public static init(config?: AppSettingsConfig): void {
    const value = (configured: string | undefined, fallback: string) =>
      configured && configured.trim().length > 0 ? configured.trim() : fallback;

    AppSettings.API_URL = value(config?.API_URL, new AppSettings().getApiUrl());

    AppSettings.API_LOGIN_ENDPOINT = value(config?.API_LOGIN_ENDPOINT, AppSettings.API_URL + '/api/authenticate/login');
    AppSettings.API_CATEGORIES = value(config?.API_CATEGORIES, AppSettings.API_URL + '/api/categories');
    AppSettings.API_CREATE_CATEGORY = value(config?.API_CREATE_CATEGORY, AppSettings.API_URL + '/api/category/AddCategory');
    AppSettings.API_DELETE_CATEGORY = value(config?.API_DELETE_CATEGORY, AppSettings.API_URL + '/api/category/DeleteCategory');
    AppSettings.API_USERS = value(config?.API_USERS, AppSettings.API_URL + '/api/users');
    AppSettings.API_DELETE_USER = value(config?.API_DELETE_USER, AppSettings.API_URL + '/api/authenticate/delete');
    AppSettings.API_CREATE_USER = value(config?.API_CREATE_USER, AppSettings.API_URL + '/api/authenticate/register');
    AppSettings.API_CHANGE_PASSWORD = value(config?.API_CHANGE_PASSWORD, AppSettings.API_URL + '/api/authenticate/changePassword');
    AppSettings.API_RECIPES = value(config?.API_RECIPES, AppSettings.API_URL + '/api/recipes');
    AppSettings.API_RECIPE = value(config?.API_RECIPE, AppSettings.API_URL + '/api/recipe/');
    AppSettings.API_RECIPE_INGREDIENTS = value(config?.API_RECIPE_INGREDIENTS, AppSettings.API_URL + '/api/ingredient/');
    AppSettings.API_RECIPE_PHOTOS = value(config?.API_RECIPE_PHOTOS, AppSettings.API_URL + '/api/photos/');
  }

  /** Get the webapi to use. */
  protected getApiUrl(): string {
    let hostname: string = window.location.hostname;
    console.log("hostname: " + hostname);
    
    switch (hostname.toLowerCase()) {
      case 'baileyfs02.baileysoft.lan':
        return this.APACHE_URL;
        break;
      case 'baileyfs02':
        return this.APACHE_URL;
        break;
      case 'kiosk-web':
        return this.CLOUD_URL;
        break;
      case 'kiosk-web.azurewebsites.net':
        return this.CLOUD_URL;
        break;
      case 'localhost':
        return this.DEVL_LIN_URL;
        break;
      default:
        return this.APACHE_URL;
    }
  }

  // #endregion
}
