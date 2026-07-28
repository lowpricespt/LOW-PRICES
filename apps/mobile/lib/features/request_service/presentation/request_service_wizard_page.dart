import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/app_stepper.dart';
import '../providers/request_service_provider.dart';
import 'steps/step_budget.dart';
import 'steps/step_category.dart';
import 'steps/step_details.dart';
import 'steps/step_location.dart';
import 'steps/step_photos.dart';
import 'steps/step_publish.dart';
import 'steps/step_summary.dart';
import 'steps/step_urgency.dart';

const _stepLabels = [
  'Categoria',
  'Detalhes',
  'Fotos',
  'Localização',
  'Urgência',
  'Orçamento',
  'Resumo',
  'Publicar',
];

const _stepWidgets = [
  StepCategory(),
  StepDetails(),
  StepPhotos(),
  StepLocation(),
  StepUrgency(),
  StepBudget(),
  StepSummary(),
  StepPublish(),
];

class RequestServiceWizardPage extends ConsumerStatefulWidget {
  const RequestServiceWizardPage({super.key});

  @override
  ConsumerState<RequestServiceWizardPage> createState() => _RequestServiceWizardPageState();
}

class _RequestServiceWizardPageState extends ConsumerState<RequestServiceWizardPage> {
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: ref.read(requestServiceProvider).currentStepIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  bool _canGoNext(RequestServiceState state) {
    final index = state.currentStepIndex;
    final data = state.formData;
    if (index == 0) return data.categoryId != null;
    if (index == 3) return data.location.trim().isNotEmpty;
    if (index == 4) return data.urgency != null;
    return true;
  }

  void _handleNext(RequestServiceState state) {
    final isLastStep = state.currentStepIndex == kRequestServiceStepCount - 1;
    if (isLastStep) {
      ref.read(requestServiceProvider.notifier).reset();
      context.go('/pedir-servico/publicado');
      return;
    }
    ref.read(requestServiceProvider.notifier).goNext();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(requestServiceProvider);
    final isFirstStep = state.currentStepIndex == 0;
    final isLastStep = state.currentStepIndex == kRequestServiceStepCount - 1;

    // Sincroniza o PageView com o estado sempre que o passo muda por fora
    // (ex.: restaurado do autosave), com uma transição animada em vez de
    // um salto brusco.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_pageController.hasClients && _pageController.page?.round() != state.currentStepIndex) {
        _pageController.animateToPage(
          state.currentStepIndex,
          duration: const Duration(milliseconds: 280),
          curve: Curves.easeInOut,
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: isFirstStep ? null : () => ref.read(requestServiceProvider.notifier).goBack(),
        ),
        title: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: AppStepper(currentStepIndex: state.currentStepIndex, stepLabels: _stepLabels),
        ),
        toolbarHeight: 72,
        actions: [
          IconButton(icon: const Icon(Icons.close), onPressed: () => context.go('/')),
        ],
      ),
      body: PageView(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(), // navegação só pelos botões, evita gestos acidentais
        children: _stepWidgets,
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _canGoNext(state) ? () => _handleNext(state) : null,
            child: Text(isLastStep ? 'Publicar pedido' : 'Continuar'),
          ),
        ),
      ),
    );
  }
}
