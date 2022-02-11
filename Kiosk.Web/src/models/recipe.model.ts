/** 
* Implementation of the Kiosk.Domain.Recipe [DataContract].
*/
export class Recipe {

  public RecId: number
  public CatId: number;
  public UserUid: string = '00000000-0000-0000-0000-000000000000';
  public Date: Date;
  public Title: string = '';
  public Description: string;
  public Instructions: string = '';
  
  /**
  * Constructor - all parameters are optional.
  * Only passed parameters are assigned to their corresponding property.
  * 
  * @param RecId The tenant id 
  * @param CatId The team id 
  * @param UserUid The team name (Guid)
  * @param Date The team owner Pulse username
  * @param Title The team owner full name
  * @param Description The number or members in the group
  * @param Instructions The Team logo 
  */
  constructor(
    RecId?: number,
    CatId?: number,
    UserUid?: string,
    Date?: Date,
    Title?: string,
    Description?: string,
    Instructions?: string) {
    if ((RecId !== undefined) && (RecId !== null)) this.RecId = RecId;
    if ((CatId !== undefined) && (CatId !== null)) this.CatId = CatId;
    if ((UserUid !== undefined) && (UserUid !== null)) this.UserUid = UserUid;
    if ((Date !== undefined) && (Date !== null)) this.Date = Date;
    if ((Title !== undefined) && (Title !== null)) this.Title = Title;
    if ((Description !== undefined) && (Description !== null)) this.Description = Description;
    if ((Instructions !== undefined) && (Instructions !== null)) this.Instructions = Instructions;    
  }
}
