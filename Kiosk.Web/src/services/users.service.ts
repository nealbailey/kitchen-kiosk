//-----------------------------------------------------------------------
// Source File:  "users.service.ts"
// Create Date:  02/04/2022 10:18:00 PM
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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppSettings } from 'src/appSettings';
import { User } from '../models/user.model';

@Injectable()
export class UsersService {
  /**
   * Constructor
   * @param http the shared httpClient reference
   */
  constructor(private http: HttpClient) {
  }

  /** Gets a collection of Category records.  */
  async GetUsers() {
    console.info("Call GET in the users Controller");
    let url: string = AppSettings.API_USERS;
    console.info(url);
    return await this.http.get<User[]>(url)
      .pipe(catchError(this.handleError)).toPromise();
  }

  /**
  * Error processing.
  * @param caught The caught error information.
  */
  private handleError(caught: any) {
    if (caught) {
      if (caught.error) {
        return throwError(caught.error);
        //console.error(caught.error.message);
        //return throwError(caught.error.message);
      }
    }
    if (caught) {
      return throwError(caught);
    }
  }
}
