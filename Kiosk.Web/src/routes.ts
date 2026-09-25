import { Routes } from '@angular/router'
import { homeComponent } from "./components/home/home.component";
import { recipeComponent } from "./components/recipe/recipe.component";
import { adminComponent } from "./components/admin/admin.component";

export const appRoutes: Routes = [
  { path: 'home', component: homeComponent },
  { path: 'admin', component: adminComponent },
  { path: 'recipe/:id', component: recipeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full'}
]
