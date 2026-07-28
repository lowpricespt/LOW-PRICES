import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/request_service_form_data.dart';

const _prefsKey = 'low_prices:request_service';
const kRequestServiceStepCount = 8;

class RequestServiceState {
  const RequestServiceState({this.currentStepIndex = 0, this.formData = const RequestServiceFormData()});

  final int currentStepIndex;
  final RequestServiceFormData formData;

  RequestServiceState copyWith({int? currentStepIndex, RequestServiceFormData? formData}) {
    return RequestServiceState(
      currentStepIndex: currentStepIndex ?? this.currentStepIndex,
      formData: formData ?? this.formData,
    );
  }
}

class RequestServiceNotifier extends StateNotifier<RequestServiceState> {
  RequestServiceNotifier() : super(const RequestServiceState()) {
    _restore();
  }

  Future<void> _restore() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefsKey);
    if (raw == null) return;

    final json = jsonDecode(raw) as Map<String, dynamic>;
    state = RequestServiceState(
      currentStepIndex: json['currentStepIndex'] as int? ?? 0,
      formData: RequestServiceFormData.fromJson(json['formData'] as Map<String, dynamic>? ?? {}),
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
    final next = (state.currentStepIndex + 1).clamp(0, kRequestServiceStepCount - 1);
    state = state.copyWith(currentStepIndex: next);
    _persist();
  }

  void goBack() {
    final previous = (state.currentStepIndex - 1).clamp(0, kRequestServiceStepCount - 1);
    state = state.copyWith(currentStepIndex: previous);
    _persist();
  }

  void updateFormData(RequestServiceFormData Function(RequestServiceFormData current) update) {
    state = state.copyWith(formData: update(state.formData));
    _persist();
  }

  Future<void> reset() async {
    state = const RequestServiceState();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefsKey);
  }
}

/// O progresso é guardado automaticamente — se o utilizador sair a meio
/// do wizard e voltar mais tarde, retoma exatamente onde ficou (mesmo
/// comportamento do `persist` do Zustand no website).
final requestServiceProvider = StateNotifierProvider<RequestServiceNotifier, RequestServiceState>(
  (ref) => RequestServiceNotifier(),
);
