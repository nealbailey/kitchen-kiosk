import { Category } from "./category.model";
import { Ingredient } from "./ingredient.model";

/** Implementation of the Kiosk.Domain.Recipe [DataContract]. */
export class Recipe {

  public recId: number
  public catId: number;
  public useruid: string = '00000000-0000-0000-0000-000000000000';
  public date: Date = new Date();
  public title: string = '';
  public description: string;
  public instructions: string = '';
  public primaryCategory: Category;
  public ingredients: Ingredient[] = [];
  public strIngredients: string = '';
  
  /**
  * Constructor - all parameters are optional.
  * Only passed parameters are assigned to their corresponding property.
  * @param recId The recipe id 
  * @param catId The primary category id 
  * @param useruid The user id (Guid)
  * @param date The modified date
  * @param title The recipe name
  * @param description The recipe description
  * @param instructions The recipe instructions
  * @param primaryCategory The main recipe category
  * @param ingredients The recipe ingredients
  */
  constructor(
    recId?: number,
    catId?: number,
    useruid?: string,
    date?: Date,
    title?: string,
    description?: string,
    instructions?: string,
    primaryCategory?: Category,
    ingredients?: Array<Ingredient>) {
    if ((recId !== undefined) && (recId !== null)) this.recId = recId;
    if ((catId !== undefined) && (catId !== null)) this.catId = catId;
    if ((useruid !== undefined) && (useruid !== null)) this.useruid = useruid;
    if ((date !== undefined) && (date !== null)) this.date = date;
    if ((title !== undefined) && (title !== null)) this.title = title;
    if ((description !== undefined) && (description !== null)) this.description = description;
    if ((instructions !== undefined) && (instructions !== null)) this.instructions = instructions;
    if ((primaryCategory !== undefined) && (primaryCategory !== null)) this.primaryCategory = primaryCategory;
    if ((ingredients !== undefined) && (ingredients !== null)) this.ingredients = ingredients;
  }
}
