import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/professional_onboarding_form_data.dart';

const _prefsKey = 'low_prices:professional_onboarding';
const kProfessionalOnboardingStepCount = 9;

class ProfessionalOnboardingState {
  const ProfessionalOnboardingState({
    this.currentStepIndex = 0,
    this.formData = const ProfessionalOnboardingFormData(),
    this.password = '',
  });

  final int currentStepIndex;
  final ProfessionalOnboardingFormData formData;

  /// Nunca gravada em `SharedPreferences` — ver nota em
  /// `ProfessionalOnboardingFormData.toJson`. Só existe em memória entre
  /// o Passo 1 e o registo efetivo.
  final String password;

  ProfessionalOnboardingState copyWith({
    int? currentStepIndex,
    ProfessionalOnboardingFormData? formData,
    String? password,
  }) {
    return ProfessionalOnboardingState(
      currentStepIndex: currentStepIndex ?? this.currentStepIndex,
      formData: formData ?? this.formData,
      password: password ?? this.password,
    );
  }
}

class ProfessionalOnboardingNotifier extends StateNotifier<ProfessionalOnboardingState> {
  ProfessionalOnboardingNotifier() : super(const ProfessionalOnboardingState()) {
    _restore();
  }

  Future<void> _restore() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefsKey);
    if (raw == null) return;

    final json = jsonDecode(raw) as Map<String, dynamic>;
    state = ProfessionalOnboardingState(
      currentStepIndex: json['currentStepIndex'] as int? ?? 0,
      formData: ProfessionalOnboardingFormData.fromJson(json['formData'] as Map<String, dynamic>? ?? {}),
    );
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _prefsKey,
      jsonEncode({'currentStepIndex': state.currentStepIndex, 'formData': state.formData.toJson()}),
    );
  }

  void goNext() {
    final next = (state.currentStepIndex + 1).clamp(0, kProfessionalOnboardingStepCount - 1);
    state = state.copyWith(currentStepIndex: next);
    _persist();
  }

  void goBack() {
    final previous = (state.currentStepIndex - 1).clamp(0, kProfessionalOnboardingStepCount - 1);
    state = state.copyWith(currentStepIndex: previous);
    _persist();
  }

  void updateFormData(
    ProfessionalOnboardingFormData Function(ProfessionalOnboardingFormData current) update,
  ) {
    state = state.copyWith(formData: update(state.formData));
    _persist();
  }

  /// Nunca chama `_persist()` — a password fica só em memória, nunca em
  /// `SharedPreferences` (que não é encriptado).
  void setPassword(String value) {
    state = state.copyWith(password: value);
  }

  Future<void> reset() async {
    state = const ProfessionalOnboardingState();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefsKey);
  }
}

final professionalOnboardingProvider =
    StateNotifierProvider<ProfessionalOnboardingNotifier, ProfessionalOnboardingState>(
  (ref) => ProfessionalOnboardingNotifier(),
);
