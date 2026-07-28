import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/auth_repository.dart';
import '../repositories/auth_repository_impl.dart';
import '../services/api_service.dart';
import '../services/connectivity_service.dart';
import '../services/image_service.dart';
import '../services/logger_service.dart';
import '../services/maps_service.dart';
import '../services/notification_service.dart';
import '../services/permission_service.dart';
import '../services/storage_service.dart';

// --- Infraestrutura (services) ---
final storageServiceProvider = Provider<StorageService>((ref) => StorageService());

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(ref.watch(storageServiceProvider));
});

final loggerServiceProvider = Provider<LoggerService>((ref) => DebugLoggerService());

final connectivityServiceProvider = Provider<ConnectivityService>((ref) => ConnectivityServiceImpl());

// --- Contratos ainda sem implementação real (ver notas em cada ficheiro) ---
final imageServiceProvider = Provider<ImageService>((ref) => StubImageService());

final permissionServiceProvider = Provider<PermissionService>((ref) => StubPermissionService());

final notificationServiceProvider = Provider<NotificationService>((ref) => StubNotificationService());

final mapsServiceProvider = Provider<MapsService>((ref) => StubMapsService());

// --- Repositórios ---
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(apiServiceProvider), ref.watch(storageServiceProvider));
});
