//-----------------------------------------------------------------------
// Source File:  "AppSettings.ts"
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

/** Public shared global constant string literals. */
export class AppSettings {

  // #region Constants
  readonly DEVL_WIN_URL = 'https://localhost:44389'; //Windows
  readonly DEVL_LIN_URL = 'https://localhost:5000'; //Linux
  readonly APACHE_URL = 'http://baileyfs02.baileysoft.lan:8001'; //Apache
  readonly PROD_URL = 'https://kiosk-data.azurewebsites.net'; //Azure
  // #endregion

  // #region Properties
  // #endregion

  // #region Properties (Static)

  /** WebAPI remote url. */
  public static API_URL = new AppSettings().getApiUrl();
    
  /** Controller endpoint for generating a bearer token. */
  public static API_LOGIN_ENDPOINT = AppSettings.API_URL + '/api/authenticate/login';

  /** Controller endpoint for fetching categories. */
  public static API_CATEGORIES = AppSettings.API_URL + '/api/categories';

  /** Controller endpoint for fetching users. */
  public static API_USERS = AppSettings.API_URL + '/api/users';

  /** Controller endpoint for fetching recipes. */
  public static API_RECIPES = AppSettings.API_URL + '/api/recipes';

  /** Controller endpoint for a single recipe. */
  public static API_RECIPE = AppSettings.API_URL + '/api/recipe/';

  /** Controller endpoint for a recipe ingredients. */
  public static API_RECIPE_INGREDIENTS = AppSettings.API_URL + '/api/ingredient/';


  // #endregion

  // #region Methods

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
        return this.PROD_URL;
        break;
      case 'kiosk-web.azurewebsites.net':
        return this.PROD_URL;
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
