/** Implementation of the Kiosk.Domain.AspNetUser [DataContract]. */
export class User {
  public id: string = '00000000-0000-0000-0000-000000000000';
  public userName: string = '';
  public email: string = '';  

  /**
  * Constructor - all parameters are optional.
  * Only passed parameters are assigned to their corresponding property.
  * @param id The user uid
  * @param userName The user name
  * @param email The email address
  */
  constructor(
    id?: string,
    userName?: string,
    email?: string) {   
    if ((id !== undefined) && (id !== null)) this.id = id;
    if ((userName !== undefined) && (userName !== null)) this.userName = userName;
    if ((email !== undefined) && (email !== null)) this.email = email;    
  }
}
