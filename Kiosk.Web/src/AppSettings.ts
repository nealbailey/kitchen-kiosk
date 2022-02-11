//-----------------------------------------------------------------------
// Source File:  "AppSettings.ts"
// Create Date:  02/04/2021 10:18:00 PM
// Last Updated: 02/11/2022 10:35:00 AM
// Authors(s):   Neal Bailey <neal.bailey@focusitinc.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: FocusIT, inc
// Software Rights Holder: FocusIT, inc
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
  readonly DEVL_URL = 'https://localhost:44389';
  readonly PROD_URL = '';    
  // #endregion

  // #region Properties
  // #endregion

  // #region Properties (Static)

  /** WebAPI remote url. */
  public static API_URL = new AppSettings().getApiUrl();
    
  /** Controller endpoint for generating a bearer token. */
  public static API_LOGIN_ENDPOINT = AppSettings.API_URL + '/api/authenticate/login';
    
  /** Controller endpoint for fetching recipes. */
  public static API_GET_RECIPES = AppSettings.API_URL + '/api/recipes';
    
  // #endregion

  // #region Methods

  /** Get the webapi to use. */
  protected getApiUrl(): string {
    let hostname: string = window.location.hostname;
    if (hostname === 'localhost')
      return this.DEVL_URL;

    return this.PROD_URL;
  }

  // #endregion
}
