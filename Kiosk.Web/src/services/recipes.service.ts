//-----------------------------------------------------------------------
// Source File:  "recipes.service.ts"
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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppSettings } from 'src/appSettings';
import { HomePageState } from '../components/home/home.state';
import { Recipe } from '../models/recipe.model';

@Injectable()
export class RecipesService {
  constructor(private http: HttpClient) { }

  /**
  * Gets a collection of Recipe records.  
  */
  async GetRecipes(homePageState: HomePageState) {
    console.info("Call GET in the webapi recipes Controller");
    let url: string = AppSettings.API_GET_RECIPES + homePageState.pagingData.CreateQueryString();
    console.info(url);
    return await this.http.get<Recipe[]>(url)
      .pipe(catchError(this.handleError)).toPromise();
  }
 
  /**
  * Error processing.
  * @param caught The caught error information.
  */
  private handleError(caught: any) {
    if (caught) {
      if (caught.error) {
        console.error(caught.error.message);
        return throwError(caught.error.message);
      }
    }
    if (caught) {
      return throwError(caught);
    }
  }

  // #endregion
}
