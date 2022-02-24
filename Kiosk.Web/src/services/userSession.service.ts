//-----------------------------------------------------------------------
// Source File:  "userSession.service.ts"
// Create Date:  03/17/2021 01:33:00 PM
// Last Updated: 02/19/2022 07:13:00 AM
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
// Copyright (c) 2011-2021 FocusIT, Inc.
//-----------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { UserSession } from 'src/models/userSession.model';

@Injectable()
export class UserSessionService {
  /**
  * Constructor
  */
  constructor() { }

  /**
   * Retrieves the user session instance from browser cache.
   * Updates the user session instance in browser cache.
   * @returns userSession instance.
   */
  getUserSession(): UserSession {
    let userSession: UserSession = JSON.parse(localStorage.getItem('token'));
    return userSession;
  }

  /** Ends a user session */
  logOutUser() {
    console.info("Cleared UserSession token.");    
    localStorage.setItem('token', JSON.stringify(new UserSession()));
  }

  /**
  * Updates the user session instance in browser cache.
  * @param userSession the updated userSession to serialize.
  */
  updateUserSession(userSession: UserSession) {
    localStorage.setItem('token', JSON.stringify(userSession));
  }

  /** Checks if the user is currently logged in */
  userIsLoggedIn(): boolean {
    let userSession: UserSession = this.getUserSession();
    if (!userSession) {
      this.updateUserSession(new UserSession());
      return false;
    }
    if (!userSession.token || !userSession.expiration || !userSession.username)
      return false;

    return this.validateUserSession();
  }

  /** Automatically logs the user off if the token is expired. */
  validateUserSession(): boolean {
    let userSession: UserSession = this.getUserSession();
    if (!userSession)
      this.updateUserSession(new UserSession());
    if (userSession && !userSession.expiration)
      userSession.expiration = new Date(Date.now() - 1000);

    if (userSession) {
      let utcnow = new Date();
      let expiry = new Date(userSession.expiration);
      if (utcnow.getTime() > expiry.getTime()) {
        console.log('Token expired. Clearing user session state.');
        //console.log('UtcNow: ' + utcnow + '. Expiration: ' + expiry);
        this.logOutUser();
        return false;
      }
    }
    
    return true;
  }
}
