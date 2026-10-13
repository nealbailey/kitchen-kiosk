# Kiosk.Api

The Kitchen Kiosk REST API. The same process also serves the [web app](../Kiosk.Web/README.md) at `/`. Everything below is available to scripts and other clients, not only the web app. See the [main README](../README.md) for installation.

- Base URL: `http://HOST:5020` (adjust for your deployment). All endpoints are under `/api`.
- Format: JSON in and out. Property names are camelCase on output. Input names are case-insensitive.
- In Development, Swagger UI is available at `/swagger`.
- A Postman collection is included: [Kiosk.Api.postman_collection.json](Kiosk.Api.postman_collection.json).

## Configuration

Settings are read from `appsettings.json` and can be overridden by environment variables (`__` replaces `:`).

| Setting (environment variable) | Required | Description |
|---|---|---|
| `ConnectionStrings__ConnStr` | Yes | MySQL connection string, e.g. `Server=localhost;Database=KIOSK;Uid=kiosk;Pwd=...` |
| `JWT__Secret` | Yes | Token signing key, at least 32 bytes. Generate with `openssl rand -hex 32`. |
| `JWT__ValidIssuer`, `JWT__ValidAudience` | No | Token issuer and audience. Default `kitchen-kiosk`. |
| `AppSettings__photosPath` | No | Root folder of recipe photos. |
| `AppSettings__photosThumbWidth` | No | Thumbnail width in pixels, 50 to 2000. Default 200. |
| `ASPNETCORE_URLS` | No | Listen address, e.g. `http://127.0.0.1:5020`. |

The service does not start if `ConnectionStrings__ConnStr` or `JWT__Secret` is missing.

### Photos

Photo files are read from the folder named `<recipe id> - <title>` (for example `12 - Apple Pie`) inside `photosPath`. Any folder whose name starts with `<recipe id> ` is used. The API has no photo upload endpoint, so add files to the folder directly. Thumbnails are generated on demand as JPEG.

## Authentication

Log in to get a JWT, then send it on protected requests:

```bash
TOKEN=$(curl -s http://localhost:5020/api/authenticate/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"ChangeMe!2026"}' | jq -r .token)

curl http://localhost:5020/api/category/AddCategory \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"category":"Desserts"}'
```

Tokens expire after 3 hours. There are two roles: **Admin** and **User**. Endpoints below are marked **Public** (no token), **Auth** (any logged-in user), or **Admin**. A missing or invalid token gives `401`, and a valid token without the Admin role gives `403`.

Many endpoints return this envelope for messages and errors:

```json
{ "status": "Success", "message": "..." }
```

`status` is `Success`, `Error`, or `Failed`.

## Endpoints

### Authentication: `/api/authenticate`

| Method and path | Access | Description |
|---|---|---|
| `POST /login` | Public | Log in. |
| `POST /register` | Admin | Create a user. |
| `POST /registerAdmin` | Admin | Create an administrator. |
| `DELETE /delete` | Admin | Delete a user without recipes. |
| `POST /changePassword` | Auth | Change the logged-in user's password. |

**`POST /api/authenticate/login`**

```json
{ "username": "admin", "password": "ChangeMe!2026" }
```

`200`:

```json
{ "token": "eyJ...", "expiration": "2026-10-13T16:00:00", "id": "guid", "isAdmin": true }
```

`401` (empty body) for a wrong user name or password.

**`POST /register`** and **`POST /registerAdmin`**

```json
{ "username": "sam", "email": "sam@example.com", "password": "Str0ng!pass" }
```

`200` with `{ "status": "Success", ... }`. `500` with `{ "status": "Error", "message": "..." }` if the user exists or the password breaks the policy (at least 6 characters, with upper case, lower case, a digit, and a symbol).

**`DELETE /delete`** with body `{ "username": "sam" }`. Returns `400` if the user owns recipes. A user name that does not exist also returns `200`.

**`POST /changePassword`** with body:

```json
{ "username": "sam", "currentPassword": "old", "newPassword": "New!pass1" }
```

The password is changed for the logged-in user. `username` is required but the token decides who is changed.

### Users: `/api/users`

| Method and path | Access | Description |
|---|---|---|
| `GET /api/users` | Public | List users. |

Returns `[ { "userName": "admin", "id": "guid", "email": "..." } ]`.

### Categories

| Method and path | Access | Description |
|---|---|---|
| `GET /api/categories` | Public | List all categories. |
| `GET /api/category/{id}` | Public | Get a category by id. |
| `GET /api/category/GetCategory?catId=1&name=Desserts` | Public | Get a category by id and/or name. |
| `POST /api/category/AddCategory` | Admin | Create a category. |
| `POST /api/category/DeleteCategory` | Admin | Delete a category. |

A category is `{ "catId": 1, "category": "Desserts", "total": 12 }`, where `total` is the number of recipes. `AddCategory` takes `{ "category": "Desserts" }`. `DeleteCategory` takes `{ "catId": 1 }` and fails with `500` if recipes still use the category. Both return the message envelope, with `500` on failure.

### Recipes

| Method and path | Access | Description |
|---|---|---|
| `GET /api/recipes` | Public | Search and list recipes. |
| `GET /api/recipe/{id}` | Public | Get one recipe by id (number) or by title. |
| `POST /api/recipe` | Auth | Create a recipe. |
| `PUT /api/recipe` | Auth | Update a recipe (owner or admin). |
| `DELETE /api/recipe/{id}` | Auth | Delete a recipe (owner or admin). |
| `PUT /api/recipe/ApplyFavorite` | Auth | Add a recipe to the caller's favorites. |
| `DELETE /api/recipe/RemoveFavorite?id=5` | Auth | Remove a recipe from the caller's favorites. |

**`GET /api/recipes`** query parameters, all optional:

| Parameter | Default | Description |
|---|---|---|
| `searchstring` | empty | Text to search for. |
| `searchType` | `none` | `recipe` (title), `ingredient`, or `none`. |
| `categoryId` | `0` | Only recipes in this category (0 is all). |
| `userId` | empty | Only recipes by this user's GUID. |
| `favorites` | `false` | Only the caller's favorites (needs a token). |
| `sortColumn` | `Title` | `Title` or `Date`. |
| `sortOrder` | `Asc` | `Asc` or `Desc`. |
| `pageNumber` | `1` | Page number. |
| `pageSize` | `25` | Page size. |
| `expand` | `false` | Include ingredients and categories. |

Returns an array of recipes. Send a token to get `isFavorite` filled in for the caller.

**`GET /api/recipe/{id}?expand=true`** returns the recipe, with ingredients, categories, and owner when `expand` is true.

**Recipe object**

```json
{
  "recId": 12,
  "catId": 3,
  "useruid": "guid",
  "date": "2026-10-13T00:00:00",
  "title": "Apple Pie",
  "description": "Classic.",
  "instructions": "<ol><li>Bake.</li></ol>",
  "primaryCategory": { "catId": 3, "category": "Desserts" },
  "ingredients": [ { "ingredient": "6 apples", "recId": 12 } ],
  "isFavorite": false,
  "isRecommended": false
}
```

To create or update a recipe, send `title`, `description`, `instructions` (HTML), `useruid` (the owner's id), `ingredients`, and `primaryCategory.catId`. Updates also need `recId`. `date` is optional and defaults to the current UTC time when omitted on create; updates always set it to the current time. `POST` returns the new recipe id. Failures return `422` with a message. Updating or deleting another user's recipe returns `422` unless the caller is an admin.

`PUT /api/recipe/ApplyFavorite` takes a recipe object (only `recId` is used) and returns the recipe id.

### Ingredients

| Method and path | Access | Description |
|---|---|---|
| `GET /api/ingredient/{recipeId}` | Public | Ingredients of a recipe. |

Returns `[ { "ingredient": "6 apples", "recId": 12 } ]`.

### Photos: `/api/photos`

| Method and path | Access | Description |
|---|---|---|
| `GET /api/photos/{recipeId}` | Public | List a recipe's photos. |
| `GET /api/photos/{recipeId}/{fileName}` | Public | The full-size image (`image/jpeg`). |
| `GET /api/photos/{recipeId}/thumb/{fileName}` | Public | A JPEG thumbnail, sized by `photosThumbWidth`. |

The list returns `[ { "recipeId": 12, "fileName": "pie.jpg", "imageUrl": "...", "imageThumbUrl": "..." } ]`. Missing files return `404`.

## Status codes

| Code | Meaning |
|---|---|
| `200` | Success. |
| `400` | Bad request, or a rule was violated (e.g. deleting a user who owns recipes). |
| `401` | Missing, expired, or invalid token, or wrong login. |
| `403` | The token's user is not an administrator. |
| `404` | Not found, or an unknown `/api` path. |
| `422` | A recipe operation failed or was not permitted. |
| `500` | Server error. The `message` field has details. |
