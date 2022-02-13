import { Recipe } from "./recipe.model";

/** Implementation of the Kiosk.Domain.Category [DataContract]. */
export class Category {
  public catId: number;
  public category: string = '';
  public total: number;
  public recipes: Recipe[] = [];

  /**
  * Constructor - all parameters are optional.
  * Only passed parameters are assigned to their corresponding property.
  * @param catId The primary category id 
  * @param category The category name
  * @param total The total number of recipes in this category (lazy)
  * @param recipes The recipes in this collection (lazy)
  */
  constructor(
    catId?: number,
    category?: string,
    total?: number,
    recipes?: Recipe[]) {   
    if ((catId !== undefined) && (catId !== null)) this.catId = catId;
    if ((category !== undefined) && (category !== null)) this.category = category;
    if ((total !== undefined) && (total !== null)) this.total = total;
    if ((recipes !== undefined) && (recipes !== null)) this.recipes = recipes;    
  }
}
