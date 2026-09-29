//-----------------------------------------------------------------------
// Source File:  "recipes.service.ts"
// Create Date:  02/04/2021 10:18:00 PM
// Last Updated: 09/22/2022 12:21:00 PM
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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppSettings, AppSettingsConfig } from 'src/appSettings';
import { Ingredient } from '../models/ingredient.model';
import { Recipe } from '../models/recipe.model';
import { HomePageState } from './home.state';
import { Photo } from '../models/photo.model';
    
@Injectable()
export class RecipesService {
  constructor(
    private http: HttpClient) { }

  /** Create a new recipe. */
  async CreateRecipe(recipe: Recipe) {
    console.info("Call POST in the api recipe Controller");
    let url: string = AppSettings.API_RECIPE;
    console.info(url);
    return await this.http.post<number>(url, recipe)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /** Delete a recipe. */
  async DeleteRecipe(id: number) {
    console.info("Call DELETE in the api recipe Controller");
    let url: string = AppSettings.API_RECIPE + id;
    console.info(url);
    return await this.http.delete(url)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /** Update a recipe. */
  async UpdateRecipe(recipe: Recipe) {
    console.info("Call PUT in the api recipe Controller");
    let url: string = AppSettings.API_RECIPE;
    console.info(url);
    return await this.http.put<Recipe>(url, recipe)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /** Gets a collection of Recipe records.  */
  async GetRecipes(homePageState: HomePageState) {
    console.info("Call GET in the api recipes Controller");
    let url: string = AppSettings.API_RECIPES + homePageState.pagingData.CreateQueryString();
    console.info(url);
    return await this.http.get<Recipe[]>(url)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /** Gets a single recipe by id.  */
  async GetRecipe(id: number) {
    console.info("Call GET in the api recipe Controller");
    let url: string = AppSettings.API_RECIPE + id + '?expand=true';
    console.info(url);
    return await this.http.get<Recipe>(url)
      .pipe(catchError(this.handleError)).toPromise();
  }

   /** Gets a single recipe by name.  */
   async GetRecipeByName(name: string) {
    console.info("Call GET in the api recipe Controller");
    let url: string = AppSettings.API_RECIPE + name;
    console.info(url);
    return await this.http.get<Recipe>(url)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /** Gets a single recipe's ingredients by recipe id.  */
  async GetRecipeIngredients(id: number) {
    console.info("Call GET in the api ingredient Controller");
    let url: string = AppSettings.API_RECIPE_INGREDIENTS + id;
    console.info(url);
    return await this.http.get<Ingredient[]>(url)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /** Gets a single recipe's photos by recipe id.  */
  async GetRecipePhotos(id: number) {
    console.info("Call GET in the api photo Controller");
    let url: string = AppSettings.API_RECIPE_PHOTOS + id;
    console.info(url);
    return await this.http.get<Photo[]>(url)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /** Set recipe as favorite. */
  async SetRecipeAsFavorite(recipe: Recipe) {
    console.info("Call PUT in the api recipe/ApplyFavorite Controller");
    let url: string = AppSettings.API_RECIPE + 'ApplyFavorite';
    console.info(url);
    return await this.http.put<number>(url, recipe)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /** Remove recipe as favorite. */
  async RemoveRecipeAsFavorite(id: number) {
    console.info("Call DELETE in the api recipe/RemoveFavorite Controller");
    let url: string = AppSettings.API_RECIPE + 'RemoveFavorite?id=' + id;
    console.info(url);
    return await this.http.delete(url)
      .pipe(catchError(this.handleError)).toPromise();
  }
 
  /**
  * Error processing.
  * @param caught The caught error information.
  */
  private handleError(caught: any): Observable<never> {
    if (caught) {
      if (caught.error) {
        return throwError(caught.error);
        //console.error(caught.error.message);
        //return throwError(caught.error.message);
      }
      return throwError(caught);
    }
    return throwError(new Error('An unknown error occurred.'));
  }

  // #endregion
}
