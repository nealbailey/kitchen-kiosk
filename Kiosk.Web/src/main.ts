import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppSettings, AppSettingsConfig } from './appSettings';

// Load the external, deployable settings file before the app module (and the
// services that read AppSettings at import time) are loaded, so an edited
// API_URL takes effect without recompiling/redeploying the app.
fetch('assets/config/app-settings.json')
  .then(response => response.ok ? response.json() : {})
  .catch(() => ({}))
  .then(async (config: AppSettingsConfig) => {
    AppSettings.init(config);

    const { AppModule } = await import('./app/app.module');

    if (environment.production) {
      enableProdMode();
    }

    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));
  });
