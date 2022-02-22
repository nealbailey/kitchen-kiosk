//-----------------------------------------------------------------------
// Source File:  "StateValidator.service.ts"
// Create Date:  02/20/2022 07:37:00 AM
// Last Updated: 02/20/2022 10:35:00 AM
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

import { Injectable } from "@angular/core";
import { arrayEx } from "../helpers/arrayEx.helper";
import { HomePageState } from "./home.state";

@Injectable()
export class StateValidator {

  //#region Properties
  /** Collection of validation errors */
  public errors: string[] = [];
  /** Custom Array handling extensions */
  protected arrayHelper: arrayEx = new arrayEx();
  //#endregion

  //#region Properties (static)
  /** The primeng style for invalid input fields */
  public static readonly inputStyleInvalid: string = 'ng-invalid ng-dirty ng-dirty-yellow';
  /** The primeng style for valid input fields */
  public static readonly inputStyleValid: string = 'ng-pristine ng-valid ng-touched';
  //#endregion

  //#region Properties (styles)

  /************
   *  Styles  *
   ***********/

  /** Step 1 - Details */
  public txtTitleStyle = StateValidator.inputStyleValid;
  /** Step 1 - Category */
  public ddlCategoryStyle = StateValidator.inputStyleValid;
  /** Step 1 - Description */
  public txtDescriptionStyle = StateValidator.inputStyleValid;
  /** Step 2 - Ingredients */
  public txtIngredientsStyle = StateValidator.inputStyleValid;
  /** Step 3 - Instructions */
  public txtDirectionsStyle = StateValidator.inputStyleValid;

  //#endregion

  // #region Constructor
  /** 
   * Constructor 
   * @param homePageState the shared application state service.
   */
  constructor(
    public homePageState: HomePageState) {
  }
  // #endregion

  //#region Methods

  /**
  * Capitalizes the first character of a string or all words in the string.
  * Leading spaces are removed.
  * When capitalizing all words, multiple spaces between words are reduced to a single space.   
  * @param strText
  * @param allWords boolean - when true, the first letter of all words are capitalized
  */
  public toProperCase(strText: string, allWords: boolean = false) {
    if (!strText)
      return strText;

    var temp = strText;
    for (var x = 0; x < strText.length; x++) {
      if (strText[x] === ' ')
        continue;
      temp = strText.substring(x);
      break;
    }

    var result: string = '';
    if (allWords) {
      let parts: string[] = temp.split(' ');
      for (var x = 0; x < parts.length; x++) {
        if (parts[x].length > 0) {
          if (x > 0)
            result += ' ';
          result += (parts[x].substring(0, 1).toUpperCase() + parts[x].substring(1));
        }
      }
      if (temp.endsWith(' '))
        result += ' ';
    }
    else {
      result += (temp.substring(0, 1).toUpperCase() + temp.substring(1));
    }

    return result;
  }

  /** Validates the wizard step object state */
  public validateCreateRecipeSteps(): boolean {
    let isValid: boolean = true;

    switch (this.homePageState.createRecipeDialogCurrentStep) {
      case 1: // Wizard Step #1
         this.txtTitleStyle = (this.validateRecipeTitle(this.homePageState.selectedRecipe.title, true))
          ? StateValidator.inputStyleValid
          : StateValidator.inputStyleInvalid;

        if (this.homePageState.selectedRecipe.title)
          this.homePageState.selectedRecipe.title = this.toProperCase(this.homePageState.selectedRecipe.title, true);

        this.ddlCategoryStyle = (!this.homePageState.selectedRecipe.primaryCategory)
          ? StateValidator.inputStyleInvalid
          : StateValidator.inputStyleValid;

        this.txtDescriptionStyle = (this.validateRecipeDescription(this.homePageState.selectedRecipe.description, true))
          ? StateValidator.inputStyleValid
          : StateValidator.inputStyleInvalid;        

        //this.ddlCategoryStyle = (this.selectedContactTypes.length != 0)
        //  ? StateValidator.inputStyleValid
        //  : StateValidator.inputStyleInvalid;

        if (this.ddlCategoryStyle == StateValidator.inputStyleInvalid
          || this.txtTitleStyle == StateValidator.inputStyleInvalid
          || this.txtDescriptionStyle == StateValidator.inputStyleInvalid)
          isValid = false;

        break;
      case 2: // Wizard Step #2
        this.txtIngredientsStyle = (!this.homePageState.selectedRecipe.ingredients)
          ? StateValidator.inputStyleInvalid
          : StateValidator.inputStyleValid;
                
        if (this.txtIngredientsStyle == StateValidator.inputStyleInvalid)
          isValid = false;

        break;
      case 3: // Wizard Step #3
        this.txtDirectionsStyle = (!this.homePageState.selectedRecipe.instructions)
          ? StateValidator.inputStyleInvalid
          : StateValidator.inputStyleValid;

        if (this.txtDirectionsStyle == StateValidator.inputStyleInvalid)
          isValid = false;

        break;
    }
    return isValid;
  }

  /**
  *  Validates the Title of a Recipe
  *  @param strTitle the title of the recipe
  *  @param required flag to indicate if the value is required or not
  *  @returns boolean flag to determine if field is valid
  */
  public validateRecipeTitle(strTitle: string, required: boolean = false) {
    this.arrayHelper.removeElement(this.errors, "Recipe Title is required.");
    this.arrayHelper.removeElement(this.errors, "Recipe Title is invalid.");

    if (!strTitle && required) {
      this.arrayHelper.uniquePush(this.errors, "Recipe Title is required.");
      return false;
    }
    if (strTitle?.length < 3) {
      this.arrayHelper.uniquePush(this.errors, "Recipe Title is invalid.");
      return false;
    }
    return true;
  }

  /**
  *  Validates the Description of a Recipe
  *  @param strText the title of the recipe
  *  @param required flag to indicate if the value is required or not
  *  @returns boolean flag to determine if field is valid
  */
  public validateRecipeDescription(strText: string, required: boolean = false) {
    this.arrayHelper.removeElement(this.errors, "Recipe Description is required.");
    this.arrayHelper.removeElement(this.errors, "Recipe Description must have at least 5 words.");

    if (!strText && required) {
      this.arrayHelper.uniquePush(this.errors, "Recipe Description is required.");
      return false;
    }
    if (strText) {
      var wordCount = strText.split(' ').length;
      if (wordCount < 5) {
        this.arrayHelper.uniquePush(this.errors, "Recipe Description must have at least 5 words.");
        return false;
      }
    }    
    return true;
  }

  //#endregion
}
