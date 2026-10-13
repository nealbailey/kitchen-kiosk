-- Kitchen Kiosk schema and initial data for MySQL 8.
-- Run once, as a MySQL administrator, against a server with no existing KIOSK database:
--   mysql -u root -p < 20260807-KIOSK-SCHEMA-MYSQL.sql
--
-- Creates the KIOSK database, all tables, the 'Admin' and 'User' roles, and one administrator:
--   username: admin    password: ChangeMe!2026
-- CHANGE THIS PASSWORD after the first login (Admin page > Change My Password).
-- The application's MySQL account is not created here; see the README for the CREATE USER/GRANT statements.

CREATE DATABASE IF NOT EXISTS `KIOSK` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `KIOSK`;

CREATE TABLE `__EFMigrationsHistory` (
 MigrationId VARCHAR(150) NOT NULL,
 ProductVersion VARCHAR(32) NOT NULL,
 PRIMARY KEY (MigrationId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `AspNetRoles`(
 Id CHAR(36) NOT NULL,
 Name VARCHAR(256),
 NormalizedName VARCHAR(256),
 ConcurrencyStamp LONGTEXT,
 PRIMARY KEY(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `AspNetUsers`(
 Id CHAR(36) NOT NULL,
 UserName VARCHAR(256),
 NormalizedUserName VARCHAR(256),
 Email VARCHAR(256),
 NormalizedEmail VARCHAR(256),
 EmailConfirmed BOOLEAN NOT NULL,
 PasswordHash LONGTEXT,
 SecurityStamp LONGTEXT,
 ConcurrencyStamp LONGTEXT,
 PhoneNumber LONGTEXT,
 PhoneNumberConfirmed BOOLEAN NOT NULL,
 TwoFactorEnabled BOOLEAN NOT NULL,
 LockoutEnd DATETIME(6) NULL,
 LockoutEnabled BOOLEAN NOT NULL,
 AccessFailedCount INT NOT NULL,
 PRIMARY KEY(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `AspNetRoleClaims`(
 Id INT NOT NULL AUTO_INCREMENT,
 RoleId CHAR(36) NOT NULL,
 ClaimType LONGTEXT,
 ClaimValue LONGTEXT,
 PRIMARY KEY(Id),
 INDEX(RoleId),
 CONSTRAINT FK_RoleClaims_Roles FOREIGN KEY(RoleId) REFERENCES AspNetRoles(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `AspNetUserClaims`(
 Id INT NOT NULL AUTO_INCREMENT,
 UserId CHAR(36) NOT NULL,
 ClaimType LONGTEXT,
 ClaimValue LONGTEXT,
 PRIMARY KEY(Id),
 INDEX(UserId),
 CONSTRAINT FK_UserClaims_Users FOREIGN KEY(UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `AspNetUserLogins`(
 LoginProvider VARCHAR(128) NOT NULL,
 ProviderKey VARCHAR(128) NOT NULL,
 ProviderDisplayName LONGTEXT,
 UserId CHAR(36) NOT NULL,
 PRIMARY KEY(LoginProvider,ProviderKey),
 INDEX(UserId),
 CONSTRAINT FK_UserLogins_Users
     FOREIGN KEY(UserId)
     REFERENCES AspNetUsers(Id)
     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `AspNetUserRoles`(
 UserId CHAR(36) NOT NULL,
 RoleId CHAR(36) NOT NULL,
 PRIMARY KEY(UserId,RoleId),
 INDEX(RoleId),
 CONSTRAINT FK_UserRoles_Users
     FOREIGN KEY(UserId)
     REFERENCES AspNetUsers(Id)
     ON DELETE CASCADE,
 CONSTRAINT FK_UserRoles_Roles
     FOREIGN KEY(RoleId)
     REFERENCES AspNetRoles(Id)
     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `AspNetUserTokens`(
 UserId CHAR(36) NOT NULL,
 LoginProvider VARCHAR(128) NOT NULL,
 Name VARCHAR(128) NOT NULL,
 Value LONGTEXT,
 PRIMARY KEY(UserId,LoginProvider,Name),
 CONSTRAINT FK_UserTokens_Users
     FOREIGN KEY(UserId)
     REFERENCES AspNetUsers(Id)
     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipeCategory(
 catId INT AUTO_INCREMENT,
 category VARCHAR(255) NOT NULL,
 total INT NULL,
 PRIMARY KEY(catId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipe(
 recId INT AUTO_INCREMENT,
 catId INT NOT NULL,
 useruid CHAR(36) NOT NULL,
 Date DATETIME NOT NULL,
 Title VARCHAR(255) NOT NULL,
 Description VARCHAR(1000),
 Instructions LONGTEXT NOT NULL,
 PRIMARY KEY(recId),
 INDEX(catId),
 INDEX(useruid),
 CONSTRAINT FK_recipe_category FOREIGN KEY(catId) REFERENCES recipeCategory(catId),
 CONSTRAINT FK_recipe_user FOREIGN KEY(useruid) REFERENCES AspNetUsers(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipeCategoryMap(
 catId INT NOT NULL,
 recId INT NOT NULL,
 PRIMARY KEY(catId,recId),
 INDEX(recId),
 CONSTRAINT FK_rcm_cat FOREIGN KEY(catId) REFERENCES recipeCategory(catId),
 CONSTRAINT FK_rcm_recipe FOREIGN KEY(recId) REFERENCES recipe(recId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipeFavorites(
 recId INT NOT NULL,
 useruid CHAR(36) NOT NULL,
 PRIMARY KEY(recId,useruid),
 INDEX(recId),
 CONSTRAINT FK_fav_recipe FOREIGN KEY(recId) REFERENCES recipe(recId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE recipeFavorites ADD CONSTRAINT FK_fav_user FOREIGN KEY(useruid) REFERENCES AspNetUsers(Id) ON DELETE CASCADE;

CREATE TABLE recipeIngredients(
 Ingredient VARCHAR(100) NOT NULL,
 recId INT NOT NULL,
 PRIMARY KEY(Ingredient,recId),
 INDEX(recId),
 CONSTRAINT FK_ing_recipe FOREIGN KEY(recId) REFERENCES recipe(recId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE UNIQUE INDEX IX_AspNetRoles_NormalizedName ON AspNetRoles(NormalizedName);
CREATE UNIQUE INDEX IX_AspNetUsers_NormalizedUserName ON AspNetUsers(NormalizedUserName);
CREATE INDEX IX_AspNetUsers_NormalizedEmail ON AspNetUsers(NormalizedEmail);

-- Initial data ------------------------------------------------------------

-- Marks the Identity schema as current so EF tooling does not try to re-create it.
INSERT INTO `__EFMigrationsHistory` (MigrationId, ProductVersion) VALUES ('20220131141440_initial', '5.0.13');

INSERT INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp) VALUES
 ('046dda50-5567-4a5e-9b04-720c17586261', 'Admin', 'ADMIN', 'a1c0c7e2-3b8d-4f55-9f0e-1d2b6c8e4a01'),
 ('f2f49159-c945-49d4-bc0c-06db01021a81', 'User',  'USER',  'a1c0c7e2-3b8d-4f55-9f0e-1d2b6c8e4a02');

-- Default administrator. Password is 'ChangeMe!2026' (ASP.NET Core Identity v3 hash). Change it after first login.
INSERT INTO AspNetUsers
 (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp,
  PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnabled, AccessFailedCount)
VALUES
 ('10278bf3-4144-4593-ac3f-975d586f8145', 'admin', 'ADMIN', 'admin@example.com', 'ADMIN@EXAMPLE.COM', 1,
  'AQAAAAIAAYagAAAAEDD5eU5cWsD7/U2Q6I8p+b0j6Zf+FnwC8t81XH5LeMh+z/WgVJcEXr/i8ZofNpM1YA==',
  'e75606ee-ce96-4442-9e94-e926619d6d73', '929e4f73-e196-4819-bd01-c9ded1303b3b',
  0, 0, 1, 0);

INSERT INTO AspNetUserRoles (UserId, RoleId) VALUES
 ('10278bf3-4144-4593-ac3f-975d586f8145', '046dda50-5567-4a5e-9b04-720c17586261');
