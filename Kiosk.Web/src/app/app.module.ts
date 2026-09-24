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
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextarea } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
import { definePreset } from '@primeng/themes';

// Warm, kitchen-inspired accent replacing PrimeNG's default blue.
const KioskPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{orange.50}',
      100: '{orange.100}',
      200: '{orange.200}',
      300: '{orange.300}',
      400: '{orange.400}',
      500: '#e2622a',
      600: '#c94f1e',
      700: '#a63e17',
      800: '{orange.800}',
      900: '{orange.900}',
      950: '{orange.950}'
    }
  }
});

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
    SelectButtonModule,
    InputTextarea,
    ConfirmDialogModule,
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
    providePrimeNG({ theme: { preset: KioskPreset, options: { darkModeSelector: '.app-dark', cssLayer: false } } }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
