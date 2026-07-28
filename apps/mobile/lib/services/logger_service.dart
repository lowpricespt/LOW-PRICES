import 'package:flutter/foundation.dart';

enum LogLevel { debug, info, warning, error }

/// Ponto único de logging da app. Nenhuma feature deve usar `print()`
/// diretamente — assim, quando ligarmos um serviço de monitorização real
/// (Sentry, Crashlytics), só este ficheiro muda.
abstract class LoggerService {
  void log(String message, {LogLevel level = LogLevel.info, Object? error, StackTrace? stackTrace});
}

class DebugLoggerService implements LoggerService {
  @override
  void log(String message, {LogLevel level = LogLevel.info, Object? error, StackTrace? stackTrace}) {
    if (kReleaseMode) return; // em produção, só um serviço real (Sentry, etc.) deve receber logs
    debugPrint('[${level.name.toUpperCase()}] $message${error != null ? ' — $error' : ''}');
  }
}
