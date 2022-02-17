//-----------------------------------------------------------------------
// Source File:  "userSession.model.ts"
// Create Date:  01/28/2021 09:10:00 PM
// Last Updated: 02/16/2021 08:45:00 AM
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
// Copyright (c) 2011-2021 Baileysoft Solutions.
//-----------------------------------------------------------------------
/**
 * Object for wrapping UserSession
 */
export class UserSession {
  public token: string = '';
  public expiration: Date;
  public id: string = '00000000-0000-0000-0000-000000000000';
  public username: string = '';
  public password: string = '';  

  /**
  * Default Constructor
  * @param token Bearer access token (Guid)
  * @param expiration UTC date the refresh token will expire
  * @param id The user uid (Guid)
  * @param username The username used to log into the application
  * @param password The password used to log into the application  
  */
  constructor(
    token?: string,
    expiration?: Date,
    id?: string,
    username?: string,
    password?: string) {

    if ((token !== undefined) && (token !== null)) this.token = token;
    if ((expiration !== undefined) && (expiration !== null)) this.expiration = expiration;
    if ((id !== undefined) && (id !== null)) this.id = id;
    if ((username !== undefined) && (username !== null)) this.username = username;
    if ((password !== password) && (password !== null)) this.password = password;    
  }
}
