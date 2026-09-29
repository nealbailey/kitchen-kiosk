import { Component } from '@angular/core';
import { PagingData } from '../models/PagingData';
import { HomePageState } from '../services/home.state';
import { UserSessionService } from '../services/userSession.service';

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
    public homePageState: HomePageState,
    private userSessionService: UserSessionService ) {
    this.initSharedState();
    this.watchColorScheme();
  }

  // #endregion

  // #region Methods (private)

  /** Create default state instance */
  private initSharedState() {
    this.homePageState = new HomePageState();
    this.homePageState.pagingData = new PagingData();
    this.userSessionService.validateUserSession();
  }

  /** Mirrors the OS light/dark preference onto <html class="app-dark"> for PrimeNG + our own styles. */
  private watchColorScheme() {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (isDark: boolean) => document.documentElement.classList.toggle('app-dark', isDark);

    apply(media.matches);
    media.addEventListener('change', event => apply(event.matches));
  }

  // #endregion
}
