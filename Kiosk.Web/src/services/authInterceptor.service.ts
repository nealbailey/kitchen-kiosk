//-----------------------------------------------------------------------
// Source File:  "authInterceptor.service.ts"
// Create Date:  01/29/2021 02:15:00 PM
// Last Updated: 02/03/2021 11:25:00 AM
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
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSession } from 'src/models/userSession.model';
import { UserSessionService } from 'src/services/userSession.service';

/**
 * Angular service to inject bearer-token and tenant into every outgoing http request.
 */
@Injectable()
export class AuthenticationInterceptorService implements HttpInterceptor {

  /** Default Constructor */
  public constructor(private userSessionService: UserSessionService) { }

  /**
  * Http Interceptor
  * Hijacks the httpRequest
  * Clones the request
  * injects custom headers
  * injects a url parameter (req) to ensure every url is unique
  */
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let session: UserSession = this.userSessionService.getUserSession();    

    // If userToken exists, clone the http request and add the bearer token
    if (this.userSessionService.userIsLoggedIn()) {
      
      console.log("Injecting JWT access_token");
      let strTokenHeader = `Bearer ${session.token}`;

      //// The Firefox javascript engine has a bug where multiple attempts to connect to the same url
      //// is seen as a denial of service attack and blocked (even if the response of the request is
      //// different for every request). To resolve this issue we must ensure every request that is
      //// made contains some unique value (in other words; urls must be unique across requests)
      //let uniqReqParam = (req.url.indexOf("?") > -1)
      //  ? "&req=" + this.getRandomInt(10)
      //  : "?req=" + this.getRandomInt(10);

      //let modifiedUrl = req.url + uniqReqParam;
      let modifiedUrl = req.url;
      //DEBUGGING: console.log("Modified URL: " + modifiedUrl);
      
      const tokenReq: HttpRequest<any> = req.clone({
        setHeaders: {
          Authorization: strTokenHeader,
          'Cache-Control': 'no-cache',
           Pragma: 'no-cache'
        },
         url: modifiedUrl 
      });      

      //'Cache-Control': 'max-age=28800'

      return next.handle(tokenReq);
    }
    return next.handle(req);
    //ToDo: Deal with exceptions
    //https://www.digitalocean.com/community/tutorials/how-to-use-angular-interceptors-to-manage-http-requests-and-error-handling

    //// catch any errors. Ensure user is logged out if necessary and have them log in
    //return next.handle(req).do((event: HttpEvent<any>) => { })
    //  .catch((err: any) => {
    //    console.log(err);
    //    if (err instanceof HttpErrorResponse && err.status === 401) {
    //      this.logout();
    //      this.login();
    //      return Observable.of();
    //    }
    //  });
  }

  /**
  * Gets random number
  * @param length   
  * @returns random int of the length specified
  */
  getRandomInt(length): number {
    let min: number = Math.ceil(0);
    let max: number = Math.floor(9);

    var i: string;
    var j: number;
    var result: string = "";

    // Don't allow length larger than int (2147483647)
    if (length > 10)
      length = 10;

    for (j = 0; j < length; j++) {
      i = (Math.floor(Math.random() * (max - min + 1)) + min).toString();
      result = result + i;
    }

    return Number(result);
  }
}
