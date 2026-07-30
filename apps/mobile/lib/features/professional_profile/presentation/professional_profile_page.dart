import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/service_categories.dart';
import '../../../core/utils/result.dart';
import '../../../models/professional_profile.dart';
import '../../../providers/app_providers.dart';
import '../../../repositories/storage_repository.dart';
import '../../../shared/widgets/app_error_state.dart';
import '../../../shared/widgets/app_feedback.dart';
import '../../../shared/widgets/app_loading.dart';
import '../../../shared/widgets/app_pickers.dart';

const _weekdays = [
  (id: 'seg', label: 'Seg'),
  (id: 'ter', label: 'Ter'),
  (id: 'qua', label: 'Qua'),
  (id: 'qui', label: 'Qui'),
  (id: 'sex', label: 'Sex'),
  (id: 'sab', label: 'Sáb'),
  (id: 'dom', label: 'Dom'),
];

const _minRadius = 1;
const _maxRadius = 150;

class ProfessionalProfilePage extends ConsumerStatefulWidget {
  const ProfessionalProfilePage({super.key});

  @override
  ConsumerState<ProfessionalProfilePage> createState() => _ProfessionalProfilePageState();
}

class _ProfessionalProfilePageState extends ConsumerState<ProfessionalProfilePage> {
  ProfessionalProfileDetails? _profile;
  bool _hasError = false;
  bool _isUploadingAvatar = false;
  bool _isSaving = false;

  final _bioController = TextEditingController();
  final _locationController = TextEditingController();
  int _radiusKm = _minRadius;
  List<String> _availableDays = [];
  List<String> _categoryIds = [];
  String? _avatarUrl;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _bioController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _hasError = false);
    final result = await ref.read(professionalRepositoryProvider).fetchProfile();
    if (!mounted) return;
    switch (result) {
      case Ok(:final value):
        setState(() {
          _profile = value;
          _bioController.text = value.bio ?? '';
          _locationController.text = value.location ?? '';
          _radiusKm = value.serviceRadiusKm;
          _availableDays = List.from(value.availableDays);
          _categoryIds = value.categories.map((category) => category.id).toList();
          _avatarUrl = value.avatarUrl;
        });
      case Err():
        setState(() => _hasError = true);
    }
  }

  Future<void> _pickAndUploadAvatar() async {
    final imageService = ref.read(imageServiceProvider);
    final path = await showAvatarPickerSheet(
      context,
      onPickFromCamera: imageService.pickFromCamera,
      onPickFromGallery: imageService.pickFromGallery,
    );
    if (path == null || !mounted) return;

    setState(() => _isUploadingAvatar = true);
    final uploadResult = await ref.read(storageRepositoryProvider).uploadFile(file: File(path), folder: UploadFolder.avatars);
    if (!mounted) return;

    switch (uploadResult) {
      case Err(:final failure):
        setState(() => _isUploadingAvatar = false);
        showAppSnackBar(context, failure.message, isError: true);
      case Ok(:final value):
        final patchResult = await ref.read(professionalRepositoryProvider).updateAvatar(value.url);
        if (!mounted) return;
        setState(() => _isUploadingAvatar = false);
        switch (patchResult) {
          case Err(:final failure):
            showAppSnackBar(context, failure.message, isError: true);
          case Ok():
            setState(() => _avatarUrl = value.url);
        }
    }
  }

  void _toggleDay(String dayId) {
    setState(() {
      if (_availableDays.contains(dayId)) {
        _availableDays.remove(dayId);
      } else {
        _availableDays.add(dayId);
      }
    });
  }

  void _toggleCategory(String categoryId) {
    setState(() {
      if (_categoryIds.contains(categoryId)) {
        _categoryIds.remove(categoryId);
      } else {
        _categoryIds.add(categoryId);
      }
    });
  }

  Future<void> _save() async {
    if (_categoryIds.isEmpty) {
      showAppSnackBar(context, 'Escolhe pelo menos uma categoria — é o que decide que pedidos vês.', isError: true);
      return;
    }

    setState(() => _isSaving = true);
    final repository = ref.read(professionalRepositoryProvider);
    final profileResult = await repository.updateProfile(
      bio: _bioController.text.trim(),
      serviceRadiusKm: _radiusKm,
      location: _locationController.text.trim(),
      availableDays: _availableDays,
    );
    final categoriesResult = await repository.updateCategories(_categoryIds);
    if (!mounted) return;
    setState(() => _isSaving = false);

    switch ((profileResult, categoriesResult)) {
      case (Err(:final failure), _):
        showAppSnackBar(context, failure.message, isError: true);
      case (_, Err(:final failure)):
        showAppSnackBar(context, failure.message, isError: true);
      default:
        showAppSnackBar(context, 'Perfil guardado.');
        _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_hasError) {
      return AppErrorState(onRetry: _load, description: 'Não foi possível carregar o teu perfil.');
    }
    if (_profile == null) {
      return const AppLoading();
    }

    final theme = Theme.of(context);
    final categoriesAsync = ref.watch(categoriesProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: _isUploadingAvatar ? null : _pickAndUploadAvatar,
              child: Container(
                width: 112,
                height: 112,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: _avatarUrl != null ? theme.colorScheme.primary : theme.dividerColor),
                  color: _avatarUrl != null ? theme.colorScheme.primary.withValues(alpha: 0.08) : null,
                  image: _avatarUrl != null ? DecorationImage(image: NetworkImage(_avatarUrl!), fit: BoxFit.cover) : null,
                ),
                child: _isUploadingAvatar
                    ? const Center(child: CircularProgressIndicator(strokeWidth: 2.5))
                    : _avatarUrl == null
                        ? Icon(Icons.camera_alt_outlined, color: theme.colorScheme.onSurface.withValues(alpha: 0.5))
                        : null,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text('Descrição pública', style: theme.textTheme.titleSmall),
          const SizedBox(height: 8),
          TextField(
            controller: _bioController,
            maxLines: 4,
            maxLength: 1000,
            decoration: const InputDecoration(hintText: 'Fala da tua experiência, especialidades e o que te diferencia.'),
          ),
          const SizedBox(height: 16),
          Text('Localização', style: theme.textTheme.titleSmall),
          const SizedBox(height: 8),
          TextField(
            controller: _locationController,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.location_on_outlined),
              hintText: 'Morada, freguesia ou código postal',
            ),
          ),
          const SizedBox(height: 24),
          Text('Raio de ação', style: theme.textTheme.titleSmall),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                Text('$_radiusKm km', style: theme.textTheme.headlineSmall?.copyWith(color: theme.colorScheme.primary)),
                Slider(
                  value: _radiusKm.toDouble(),
                  min: _minRadius.toDouble(),
                  max: _maxRadius.toDouble(),
                  divisions: _maxRadius - _minRadius,
                  label: '$_radiusKm km',
                  onChanged: (value) => setState(() => _radiusKm = value.round()),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text('Disponibilidade semanal', style: theme.textTheme.titleSmall),
          const SizedBox(height: 4),
          Text(
            'Dias em que costumas estar disponível — ainda não filtra os pedidos que vês.',
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _weekdays.map((day) {
              final isSelected = _availableDays.contains(day.id);
              return FilterChip(
                label: Text(day.label),
                selected: isSelected,
                onSelected: (_) => _toggleDay(day.id),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          Text('Categorias', style: theme.textTheme.titleSmall),
          const SizedBox(height: 4),
          Text('Decide que pedidos vês em "Pedidos disponíveis".', style: theme.textTheme.bodySmall),
          const SizedBox(height: 12),
          categoriesAsync.when(
            loading: () => const Padding(padding: EdgeInsets.only(top: 16), child: AppLoading()),
            error: (error, _) => AppErrorState(
              onRetry: () => ref.invalidate(categoriesProvider),
              description: 'Não foi possível carregar as categorias.',
            ),
            data: (categories) => Wrap(
              spacing: 8,
              runSpacing: 8,
              children: categories.map((category) {
                final isSelected = _categoryIds.contains(category.id);
                return FilterChip(
                  label: Text(category.name),
                  avatar: Icon(iconForCategorySlug(category.slug), size: 18),
                  selected: isSelected,
                  onSelected: (_) => _toggleCategory(category.id),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _save,
              child: Text(_isSaving ? 'A guardar…' : 'Guardar alterações'),
            ),
          ),
        ],
      ),
    );
  }
}
