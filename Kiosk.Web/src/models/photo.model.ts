import { Recipe } from "./recipe.model";    

/** Implementation of the Kiosk.Domain.Photo [DataContract]. */
export class Photo {

  public recipeId: number = 0;
  public fileName: string = '';
  public filePath: string = '';
  public fileFullPath: string = '';
  public imageUrl: string = '';
  public imageThumbUrl: string = '';   
  
  /**
  * Constructor - all parameters are optional.
  * Only passed parameters are assigned to their corresponding property.
  * @param recipeId The recipe id 
  * @param fileName The file name of the photo
  * @param filePath The relative file path of the photo
  * @param fileFullPath The full file path of the photo
  * @param imageUrl The URL of the photo
  * @param imageThumbUrl The URL of the photo thumbnail
  * @param recipe The full recipe reference this ingredient belongs to
  */
  constructor(
    recipeId?: number,
    fileName?: string,
    filePath?: string,
    fileFullPath?: string,
    imageUrl?: string,
    imageThumbUrl?: string) {
    if ((recipeId !== undefined) && (recipeId !== null)) this.recipeId = recipeId;
    if ((fileName !== undefined) && (fileName !== null)) this.fileName = fileName;
    if ((filePath !== undefined) && (filePath !== null)) this.filePath = filePath;
    if ((fileFullPath !== undefined) && (fileFullPath !== null)) this.fileFullPath = fileFullPath;
    if ((imageUrl !== undefined) && (imageUrl !== null)) this.imageUrl = imageUrl;
    if ((imageThumbUrl !== undefined) && (imageThumbUrl !== null)) this.imageThumbUrl = imageThumbUrl;
  }
}
