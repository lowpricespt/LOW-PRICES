# Low Prices — App (Flutter)

Fundação da app: tema (light/dark, laranja de marca), logótipo vetorial (mesmo traço do
website, desenhado com `CustomPainter`), router (`go_router`) e cliente HTTP (`dio`)
já preparado para falar com o mesmo backend NestJS da Fase 1.

## Pré-requisitos

- Flutter SDK (canal stable) — `flutter --version` deve mostrar 3.24+
- Android Studio (para o SDK Android) e/ou Xcode (só em Mac, para iOS)
- Um emulador Android ou simulador iOS a correr, ou um dispositivo físico ligado

## Como correr

```bash
cd apps/mobile
flutter pub get
flutter run
```

Se estiveres a correr no **emulador Android** e quiseres testar contra o backend NestJS
local (Fase 1), o `api_client.dart` já aponta por omissão para `http://10.0.2.2:3000`
(o alias que o emulador Android usa para o `localhost` da tua máquina). Em iOS
Simulator, `localhost:3000` funciona diretamente — nesse caso corre com:

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

## Como testar

```bash
flutter analyze
```

Deve terminar sem erros. Depois `flutter run` deve abrir o ecrã inicial com o
símbolo da marca, o título e os dois botões (ainda sem navegação real).

## Estrutura

```
lib/
├── main.dart
├── core/
│   ├── theme/app_theme.dart       # cores + tipografia, espelha o globals.css do website
│   ├── routing/app_router.dart     # go_router — só "/" nesta fase
│   └── network/api_client.dart     # dio + secure storage do token
├── features/
│   └── home/presentation/home_page.dart
└── shared_widgets/
    ├── logo_mark.dart               # símbolo vetorial (CustomPainter)
    └── logo_horizontal.dart
```
