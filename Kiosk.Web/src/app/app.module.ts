import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

// Routes
import { appRoutes } from '../routes'

//Services
import { LoginService } from 'src/services/login.service';
import { AuthenticationInterceptorService } from 'src/services/authInterceptor.service';
import { UserSessionService } from 'src/services/userSession.service';
import { HomePageState } from 'src/services/home.state';
import { StateValidator } from 'src/services/stateValidator.service';
import { CategoriesService } from 'src/services/categories.service';
import { RecipesService } from 'src/services/recipes.service';
import { UsersService } from 'src/services/users.service';
import { ToastService } from 'src/services/toast.service';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

//Components
import { AppComponent } from './app.component';
import { topnavComponent } from 'src/components/topnav/topnav.component';
import { sidebarComponent } from 'src/components/sidebar/sidebar.component';
import { homeComponent } from 'src/components/home/home.component';
import { recipeComponent } from 'src/components/recipe/recipe.component';
import { createRecipeDialogComponent } from 'src/components/recipe/createRecipeDialog.component'
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    topnavComponent,
    sidebarComponent,
    homeComponent,
    recipeComponent,
    createRecipeDialogComponent,
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
    DropdownModule,
    InputTextarea,
    ConfirmDialogModule,
    MenuModule,
  ],
  providers: [
    AuthenticationInterceptorService,
    ConfirmationService,
    HomePageState,
    StateValidator,
    LoginService,
    UserSessionService,
    ToastService,
    RecipesService,
    CategoriesService,
    UsersService,
    MessageService,
    providePrimeNG({ theme: { preset: Aura } }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
