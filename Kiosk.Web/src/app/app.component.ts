import { Component } from '@angular/core';
import { HomePageState } from '../components/home/home.state';
import { PagingData } from '../models/PagingData';
import { RecipesService } from '../services/recipes.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'KioskWeb';

  // #region Properties
  public homePageState: HomePageState;
  // #endregion

  // #region Constructors

  /** Constructor */
  constructor(private recipeService: RecipesService) {
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

  /**
  * User entered a search word
  * @param input
  */
  async searchEntered(input: any) {
    if (!input)
      return;

    if (input.value.length == 0)
      await this.getData();

    if (input.value.length < 4)
      return;
        
    setTimeout(() => {
      console.log("Search: " + input.value)
    }, 1000);

    await this.getData();
  }

  /** 
 * Retrieves all necessary data for this component. 
 */
  async getData() {
    // start the progress bar/spinner or display a skeleton.
    //this.loadingPage = true;

    try {
      this.homePageState.recipes = await this.recipeService.GetRecipes(this.homePageState);
      //console.log(this.Recipes);

      // when data is retrieved, set this.loadingPage to false.
      //this.loadingPage = false;

    } catch (message: any) {
      console.log(message);
      //this.loadingPage = false;
    }

    // REMOVE this when acquiring data via a Web API call. 
    //this.loadingPage = false;
  }
}
