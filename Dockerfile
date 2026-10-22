FROM node:22-bookworm-slim AS web
WORKDIR /src/Kiosk.Web
COPY Kiosk.Web/package*.json ./
RUN npm ci
COPY Kiosk.Web/ ./
RUN npm run build:prod

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY global.json ./
COPY Kiosk.Api/ Kiosk.Api/
COPY Kiosk.Data/ Kiosk.Data/
COPY Kiosk.Domain/ Kiosk.Domain/
COPY --from=web /src/Kiosk.Api/wwwroot/ Kiosk.Api/wwwroot/
RUN dotnet publish Kiosk.Api/Kiosk.Api.csproj -c Release -r linux-x64 --self-contained true -p:PublishSingleFile=true -o /app/publish

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0-noble
WORKDIR /app
COPY --from=build /app/publish/ ./
ENV ASPNETCORE_ENVIRONMENT=Production ASPNETCORE_URLS=http://+:5020
USER $APP_UID
EXPOSE 5020
ENTRYPOINT ["./Kiosk.Api"]