# Trail Composer: instalacja

## Środowisko rozwojowe

### 1. Instalowanie pakietów NuGet
Z poziomu root projektu wywołaj komendę:
>dotnet restore

### 2. Konfiguracja bazy danych
Skrypt tworzący bazę danych znajduje się w DBScripts/Trail_composer_entity_diagram_create
Connection string do bazy danych należy wpisać w appsettings.json:
>"ConnectionStrings": {
>"Azure_DB": "twoj_connection_string"
>},

### 3. Konfiguracja autoryzacji użytkowników

## Środowisko produkcyjne

Przed publikacją aplikacji upewnij się, że projekt jest prawidłowo skonfigurowany dla środowiska rozwojowego

