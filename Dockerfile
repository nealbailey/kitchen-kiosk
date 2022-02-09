FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /app  
COPY Kiosk.Api/ *.csproj ./  
RUN dotnet restore  
COPY . ./  
RUN dotnet publish KitchenKioskNGEN.sln -c Release -o out  

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app  
COPY --from=build-env /app/out .  
ENTRYPOINT ["dotnet", "Kiosk.Api.dll"]
