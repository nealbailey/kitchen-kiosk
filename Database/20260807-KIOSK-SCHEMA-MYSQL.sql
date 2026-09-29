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
 LockoutEnd DATETIME NULL,
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
 CONSTRAINT FK_RoleClaims_Roles FOREIGN KEY(RoleId) REFERENCES AspNetRoles(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `AspNetUserClaims`(
 Id INT NOT NULL AUTO_INCREMENT,
 UserId CHAR(36) NOT NULL,
 ClaimType LONGTEXT,
 ClaimValue LONGTEXT,
 PRIMARY KEY(Id),
 INDEX(UserId),
 CONSTRAINT FK_UserClaims_Users FOREIGN KEY(UserId) REFERENCES AspNetUsers(Id)
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
