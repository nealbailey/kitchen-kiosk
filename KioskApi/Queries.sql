USE [KIOSK]
--UPDATE recipe SET useruid = 'ABC4BBF1-5BB4-43DF-8C1B-CA5B1C85883D' where userid = 1;
--UPDATE recipe SET useruid = 'DB054045-2989-48AD-9440-57C74023159E' where userid = 2;
--UPDATE recipe SET useruid = 'A464F2DA-56E6-4B14-A562-77FE69F626AE' where userid = 3;
--UPDATE recipe SET useruid = 'A1AEC772-D33D-42C3-B667-17EA6051EBC8' where userid = 7;

SELECT COUNT(*) FROM recipe WHERE useruid = 'ABC4BBF1-5BB4-43DF-8C1B-CA5B1C85883D'

--Get Favorites
SELECT * FROM recipe r WHERE r.useruid 
	IN (SELECT useruid FROM recipeFavorites WHERE useruid = 'ABC4BBF1-5BB4-43DF-8C1B-CA5B1C85883D')
	ORDER BY r.Date DESC;

----Sync categories
----INSERT INTO recipeCategories (catId, recId) SELECT recId, catId FROM recipe WHERE catId IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20);
--DELETE FROM recipeCategories
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 1;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 2;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 3;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 4;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 5;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 6;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 7;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 8;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 9;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 10;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 11;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 12;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 13;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 14;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 15;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 16;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 17;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 18;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 19;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 20;
--INSERT INTO recipeCategories (catId, recId) SELECT catId, recId FROM recipe WHERE catId = 21;

--Get all recipes (with ingredients)
SELECT r.recId, r.useruid, r.[Date], r.Title, r.[Description],i.Ingredient, r.Instructions, c.catId, c.category 
FROM recipe r, recipeCategory c, recipeIngredients i 
WHERE r.recId = i.recId
AND r.recId = 
	(SELECT recId FROM recipeCategoryMap 
	 WHERE recId = r.recId and catId = c.catId)
ORDER BY [Date] DESC;

--Get all recipes (without ingredients)
SELECT r.recId, r.useruid, r.[Date], r.Title, r.[Description], r.Instructions, c.catId, c.category 
FROM recipe r, recipeCategory c
WHERE r.recId = 
	(SELECT recId FROM recipeCategoryMap 
	 WHERE recId = r.recId and catId = c.catId)
ORDER BY [Date] DESC;

--Get Recipes by Category
SELECT r.recId, r.useruid, r.[Date], r.Title, r.[Description], r.Instructions, c.catId, c.category 
FROM recipe r, recipeCategory c
WHERE r.recId = 
 (SELECT recId FROM recipeCategoryMap
  WHERE recId = r.recId and catId = c.catId and category = 'crockpot')

--Get number of recipes in each category
SELECT CatId as CategoryId, count(CatId) AS Recipes 
FROM Recipe 
GROUP By catId