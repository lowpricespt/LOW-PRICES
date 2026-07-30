import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/utils/result.dart';
import '../models/category.dart';
import '../repositories/auth_repository.dart';
import '../repositories/auth_repository_impl.dart';
import '../repositories/categories_repository.dart';
import '../repositories/documents_repository.dart';
import '../repositories/jobs_repository.dart';
import '../repositories/messages_repository.dart';
import '../repositories/pricing_repository.dart';
import '../repositories/professional_repository.dart';
import '../repositories/quotes_repository.dart';
import '../repositories/requests_repository.dart';
import '../repositories/reviews_repository.dart';
import '../repositories/storage_repository.dart';
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

final imageServiceProvider = Provider<ImageService>((ref) => ImageServiceImpl());

// --- Contratos ainda sem implementação real (ver notas em cada ficheiro) ---
final permissionServiceProvider = Provider<PermissionService>((ref) => StubPermissionService());

final notificationServiceProvider = Provider<NotificationService>((ref) => StubNotificationService());

final mapsServiceProvider = Provider<MapsService>((ref) => StubMapsService());

// --- Repositórios ---
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(apiServiceProvider), ref.watch(storageServiceProvider));
});

final categoriesRepositoryProvider = Provider<CategoriesRepository>((ref) {
  return CategoriesRepository(ref.watch(apiServiceProvider));
});

final storageRepositoryProvider = Provider<StorageRepository>((ref) {
  return StorageRepository(ref.watch(apiServiceProvider));
});

final requestsRepositoryProvider = Provider<RequestsRepository>((ref) {
  return RequestsRepository(ref.watch(apiServiceProvider));
});

final professionalRepositoryProvider = Provider<ProfessionalRepository>((ref) {
  return ProfessionalRepository(ref.watch(apiServiceProvider));
});

final documentsRepositoryProvider = Provider<DocumentsRepository>((ref) {
  return DocumentsRepository(ref.watch(apiServiceProvider));
});

final quotesRepositoryProvider = Provider<QuotesRepository>((ref) {
  return QuotesRepository(ref.watch(apiServiceProvider));
});

final messagesRepositoryProvider = Provider<MessagesRepository>((ref) {
  return MessagesRepository(ref.watch(apiServiceProvider));
});

final jobsRepositoryProvider = Provider<JobsRepository>((ref) {
  return JobsRepository(ref.watch(apiServiceProvider));
});

final reviewsRepositoryProvider = Provider<ReviewsRepository>((ref) {
  return ReviewsRepository(ref.watch(apiServiceProvider));
});

final pricingRepositoryProvider = Provider<PricingRepository>((ref) {
  return PricingRepository(ref.watch(apiServiceProvider));
});

/// Categorias reais vindas da API (`GET /categories`, endpoint público) —
/// nunca a lista estática antiga, que usava slugs como "id" fake.
final categoriesProvider = FutureProvider<List<ServiceCategoryModel>>((ref) async {
  final result = await ref.watch(categoriesRepositoryProvider).fetchCategories();
  return switch (result) {
    Ok(:final value) => value,
    Err(:final failure) => throw failure,
  };
});

/// Índice do separador ativo no `DashboardScaffold` atual (cliente ou
/// profissional — só um está montado de cada vez). O `IndexedStack` do
/// scaffold mantém todos os separadores vivos para não perder scroll/
/// estado, o que significa que o `initState()` de cada um só corre uma
/// vez — sem isto, contagens como "Pedidos ativos" ou "Pedidos
/// disponíveis" ficavam congeladas no valor do primeiro carregamento e
/// nunca refletiam ações feitas noutro separador (criar pedido, enviar
/// orçamento, etc.). Os separadores "Início" fazem `ref.listen` a isto
/// e recarregam sempre que voltam a ficar visíveis.
final dashboardTabIndexProvider = StateProvider<int>((ref) => 0);
