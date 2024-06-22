# Trail Composer

[Przykładowa aplikacja w środowisku produkcyjnym](https://trailcomposerbackend.azurewebsites.net/)

# Instalacja

## Środowisko rozwojowe

### 1. Instalowanie pakietów NuGet
Z poziomu root projektu wywołaj komendę:
>dotnet restore

### 2. Konfiguracja bazy danych
Skrypt tworzący bazę danych znajduje się w DBScripts/Trail_composer_entity_diagram_create
Connection string do bazy danych należy wpisać w appsettings.json w przeznaczonym do tego miejscu.

### 3. Konfiguracja autoryzacji użytkowników

Aplikacja zakłada korzystanie z usługi Azure AD B2C. Aplikacja wymaga przepływów użytkownika (ang. user flows):
* rejestrowanie  i logowanie ("SignUpSignInPolicyId")
* resetowanie hasła ("ResetPasswordPolicyId")
* edytowanie profilu (wykorzystywany atrybut to "Nazwa wyświetlana") ("EditProfilePolicyId")

Nazwy przepływów użytkownika używanych w Azure AD B2C oraz nazwa domeny ("Instance"), indentyfikator subskrypcji ("ClientId") oraz nazwa domeny ("Domain") powinny zostać wprowadzone w odpowiednich miejscach w pliku appsettings.json
Ponadto w pliku ClientApp/src/authConfig.js należy wprowadzić odpowiednie url do przepływów użytkowników, nazwę domeny, indentyfikator subskrypcji oraz redirectUri dla opublikowanej aplikacji w przeznaczonych do tego miejscach.
Jeżeli aplikacja nie jest opublikowania upewnij się, że w ClientApp/src/index.js jest wykorzystywana msalConfigLocal. Jeżeli zmienisz port dla serwera proxy, nie zapomnij zmienić msalConfigLocal.auth.redirectUri na nowe.

## Środowisko produkcyjne

Przed publikacją aplikacji upewnij się, że projekt jest prawidłowo skonfigurowany dla środowiska rozwojowego, tzn. aplikacja kliencka korzysta z poprawnie skonfigurowanego msalConfigAzure w pliku index.js
Publikacja odbywa się za pomocą Visual Studio 2022 (lub nowsze) na wybrany Azure AppService.
