//-----------------------------------------------------------------------
// Source File:  "topnav.component.ts"
// Create Date:  02/15/2022 10:10:00 AM
// Last Updated: 02/16/2022 10:35:00 AM
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
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({ 
    encapsulation: ViewEncapsulation.None, 
    selector: 'topnav-root', 
    templateUrl: './topnav.component.html', 
    styleUrls: ['./topnav.component.scss'] 
}) 
export class topnavComponent implements OnInit, AfterViewInit { 

  // #region Constructor
  /** Constructor */ 
  constructor() { 
  }
  // #endregion
 
  // #region Component Initialization 

  /** Occurs upon component initialization */
  async ngOnInit(): Promise<void> { 
    // obtain data for the page     
  } 
 
  /** Occurs after view initialization */ 
  ngAfterViewInit(): void { 
    // allow ngAfterViewInit() to complete before setting control states
    // otherwise a non-fatal exception is thrown
    setTimeout(() => {
      this.setControlStates();
    }, 10);
  } 
 
  /** Sets control states based upon permissions/current data values. */
  setControlStates() {
    // Remove this in the future
    //this.toastService.showWarning('Page is under construction. No data will be returned.');
  }

  // #endregion

  // #region Data Acquisition 

  /** Retrieves all necessary data for this component. */ 
  async getData() { 
  }

  // #endregion

  // #region Methods
  // #endregion

  // #region Event Handlers 
  // #endregion
} 
 
