import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

// Routes
import { appRoutes } from '../routes'

//Services
import { LoginService } from 'src/services/login.service';
import { UserSessionService } from 'src/services/userSession.service';
import { HomePageState } from 'src/services/home.state';
import { CategoriesService } from 'src/services/categories.service';
import { RecipesService } from 'src/services/recipes.service';
import { ToastService } from 'src/services/toast.service';
import { MessageService } from 'primeng/api';

//Components
import { AppComponent } from './app.component';
import { topnavComponent } from 'src/components/topnav/topnav.component';
import { sidebarComponent } from 'src/components/sidebar/sidebar.component';
import { homeComponent } from 'src/components/home/home.component';
import { recipeComponent } from 'src/components/recipe/recipe.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    topnavComponent,
    sidebarComponent,
    homeComponent,
    recipeComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ButtonModule,
    ChipModule,
    DialogModule,
    ProgressSpinnerModule,
    BrowserAnimationsModule,
    OverlayPanelModule,
    InputTextModule,
    ToastModule,
  ],
  providers: [
    HomePageState,
    LoginService,
    UserSessionService,
    ToastService,
    RecipesService,
    CategoriesService,
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
