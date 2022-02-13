import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";

// Routes
import { appRoutes } from '../routes'

//Services
import { RecipesService } from 'src/services/recipes.service';
import { HomePageState } from 'src/services/home.state';

//Components
import { AppComponent } from './app.component';
import { sidebarComponent } from 'src/components/sidebar/sidebar.component';
import { homeComponent } from 'src/components/home/home.component';
import { recipeComponent } from 'src/components/recipe/recipe.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    sidebarComponent,
    homeComponent,
    recipeComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ButtonModule
  ],
  providers: [
    HomePageState,
    RecipesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
