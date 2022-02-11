import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from "@angular/forms";

import { AppComponent } from './app.component';

//Services
import { RecipesService } from 'src/services/recipes.service';

//Components
import { homeComponent } from 'src/components/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    homeComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule
  ],
  providers: [
    RecipesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
