To generate model entities from existing database:
Scaffold-DbContext "Data Source=SQL_SERVER_HOST,1433;Initial Catalog=KIOSK;User ID=SQL_SERVER_USER;Password=REPLACE_LOCALLY_DO_NOT_COMMIT;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models

https://www.entityframeworktutorial.net/efcore/create-model-for-existing-database-in-ef-core.aspx