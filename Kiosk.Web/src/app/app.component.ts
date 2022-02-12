import { Component } from '@angular/core';
import { PagingData } from '../models/PagingData';
import { HomePageState } from '../services/home.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'KioskWeb';

  // #region Properties
  // #endregion

  // #region Constructors

  /**
   *  Constructor
   *  @param homePageState the shared application state service
   * */
  constructor(
    private homePageState: HomePageState) {
    this.initSharedState();
  }

  // #endregion

  // #region Methods (private)

  /** Create default state instance */
  private initSharedState() {
    this.homePageState = new HomePageState();
    this.homePageState.pagingData = new PagingData();
  }

  // #endregion
}
