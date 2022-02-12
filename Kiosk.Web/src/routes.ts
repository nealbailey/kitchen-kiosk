import { Routes } from '@angular/router'
import { homeComponent } from "./components/home/home.component";
import { recipeComponent } from "./components/recipe/recipe.component";

export const appRoutes: Routes = [
  { path: 'home', component: homeComponent },
  { path: 'recipe/:id', component: recipeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full'}
]
