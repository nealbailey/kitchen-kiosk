//-----------------------------------------------------------------------
// Source File:  "login.service.ts"
// Create Date:  01/28/2021 01:25:00 PM
// Last Updated: 08/26/2026 12:11:00 PM
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
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserSession } from 'src/models/userSession.model';
import { AppSettings } from '../appSettings';

/**
 * Interface for wrapping api response from login.
 */
export interface LoginResponse {
  token: string;
  expiration: Date;
  id: string;
  isAdmin: boolean;
}

/**
 * Object for Retrieving webapi hosted data
 */
@Injectable()
export class LoginService {
  /**
  * Constructor
  */
  constructor(private http: HttpClient) { }

  /**
  * Gets the initial auth_session token structure
  * @param userSession The current [[UserSession]] structure
  */
  async loginWithUserPass(userSession: UserSession) {
    //var strUserPass = 'Basic ' + btoa(userSession.username + ':' + userSession.password);
    //const httpOptions = {
    //  headers: new HttpHeaders(
    //    {
    //      'Content-Type': 'application/json',
    //      'Authorization': strUserPass,
    //    }
    //  )
    //};

    // call POST in the webapi loginController
    return await this.http.post<LoginResponse>(AppSettings.API_LOGIN_ENDPOINT, userSession)
      .pipe(
        catchError(this.handleError),
        tap(response => {
          this.handleAuthentication(response, userSession);
        })).toPromise();
  }

  /**
  * Refreshes the current user auth_session
  * @param userSession The current [[UserSession]] structure
  */
  async loginWithBearerToken(userSession: UserSession) {
    //// call POST in the webapi loginController
    //return await this.http.post<LoginResponse>(AppSettings.API_TOKEN_REFRESH_ENDPOINT, {})
    //  .pipe(
    //    catchError(this.handleError),
    //    tap(response => {
    //      this.handleAuthentication(response, userSession);
    //    })).toPromise();
  }

  /**
  * Processes authentication actions from /api/authenticate/login route
  * @param response Login response from the controller
  * @param userSession [[UserSession]] structure from api
  */
  private handleAuthentication(response: LoginResponse, userSession: UserSession) {
    //console.log(response);
    userSession.token = response.token;
    userSession.expiration = response.expiration;
    userSession.id = response.id;
    userSession.isAdmin = response.isAdmin;

    // Serialize the token data
    userSession.password = ''; // do NOT serialize password
    localStorage.setItem('token', JSON.stringify(userSession));
  }

  /**
  * Error processing.
  * @param caught The caught error information.
  */
  private handleError(caught: any) {
    if (caught) {
      if (caught.error) {
        return throwError(caught.error.status + ' ' + caught.error.title)
      }
    }
    if (caught) {
      return throwError(caught);
    }
  }
}
