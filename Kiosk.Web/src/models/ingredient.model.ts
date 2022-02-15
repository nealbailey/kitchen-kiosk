import { Recipe } from "./recipe.model";

/** Implementation of the Kiosk.Domain.Ingredient [DataContract]. */
export class Ingredient {

  public recId: number
  public ingredient: string = '';
  public recipe: Recipe;
  
  /**
  * Constructor - all parameters are optional.
  * Only passed parameters are assigned to their corresponding property.
  * @param recId The recipe id 
  * @param ingredient The recipe ingredient value  
  * @param recipe The full recipe reference this ingredient belongs to
  */
  constructor(
    recId?: number,
    ingredient?: string,
    recipe?: Recipe) {
    if ((recId !== undefined) && (recId !== null)) this.recId = recId;
    if ((ingredient !== undefined) && (ingredient !== null)) this.ingredient = ingredient;    
    if ((recipe !== undefined) && (recipe !== null)) this.recipe = recipe;
  }
}
