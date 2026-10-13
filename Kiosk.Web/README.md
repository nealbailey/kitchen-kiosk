# Kiosk.Web

The Kitchen Kiosk web app, built with Angular and PrimeNG. It is served by Kiosk.Api from `Kiosk.Api/wwwroot`, so no separate web server is needed. See the [main README](../README.md) for installation.

## First login

1. Browse to your Kitchen Kiosk address, for example `http://localhost:5020`.
2. Click **Login** in the top right.
3. Enter the default administrator credentials and click **Submit**:
   - Username: `admin`
   - Password: `ChangeMe!2026`
4. Your user name replaces the **Login** button, and **Add Recipe** and **Sign Out** buttons appear.
5. **Change the default password now.** Click **Admin** in the left sidebar, open **Change My Password**, enter the current password and a new one twice, and click **Change Password**. Passwords need at least 6 characters with an upper-case letter, a lower-case letter, a digit, and a symbol.

Sessions last 3 hours. After that you are asked to log in again.

## Add a new user

Only administrators can create users.

1. Click **Admin** in the left sidebar.
2. Open the **User Management** section, under **Create New User**.
3. Fill in **Username**, **Email**, **Password**, and **Confirm password**.
4. Set **Account type** to a standard user (can add and edit their own recipes) or administrator (can also manage users and categories, and edit any recipe).
5. Click **Create User**. Give the person their username and password, and ask them to change the password after logging in.

To remove a user, select them under **Delete User** and click **Delete User**. Users who own recipes cannot be deleted.

## Add a category

Only administrators can manage categories. Add at least one before creating recipes, because every recipe needs a category.

1. Click **Admin** in the left sidebar.
2. Open the **Category Management** section, under **Create Category**, and enter a name in the **Category name** box.
3. Click **Add Category**. The category appears in the sidebar and in the category lists.

To remove a category, select it under **Delete Category** and click **Delete Category**. A category that still has recipes cannot be deleted.

## Add your first recipe

1. Log in and click **Add Recipe** at the top of the page. The **Create Recipe** wizard has three steps.
2. **Step 1:** Enter a **Title**, choose a **Category**, and write a short **Description**. Click **Next**.
3. **Step 2:** Type the **Ingredients**, one per line. Click **Next**.
4. **Step 3:** Write the **Instructions** in the editor. It supports headings, bold, italic, underline, and numbered and bulleted lists. Click **Save**.
5. The new recipe appears on the home page. Click it to open the full recipe.

Recipe owners and administrators see **edit** (pencil) and **delete** (x) buttons on each recipe. Click the heart button to add a recipe to **My Favorites**.

### Finding recipes

The home page can search by recipe title or ingredient, filter by category and author, and sort by title or date. Active filters appear as chips that can be removed with their x.

### Photos

Photos are not uploaded through the web app. Place image files in a folder named `<recipe id> - <title>` inside the photos folder configured with `AppSettings__photosPath` (see [Photos](../Kiosk.Api/README.md#photos)). The recipe page shows them automatically.

## Development

```bash
npm install
npm start               # http://localhost:4200, calls the API at http://localhost:5020
npm run build:prod      # builds into ../Kiosk.Api/wwwroot
```

The API address defaults to the same origin as the page. To point the app at a different API, set `API_URL` in `src/assets/config/app-settings.json` (it is also editable in the published `wwwroot/assets/config/app-settings.json`).
