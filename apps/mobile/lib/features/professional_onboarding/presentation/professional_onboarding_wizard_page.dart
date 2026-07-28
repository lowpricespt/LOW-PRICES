import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/app_stepper.dart';
import '../providers/professional_onboarding_provider.dart';
import 'steps/step_account.dart';
import 'steps/step_availability.dart';
import 'steps/step_categories.dart';
import 'steps/step_description.dart';
import 'steps/step_documentation.dart';
import 'steps/step_location.dart';
import 'steps/step_photo.dart';
import 'steps/step_radius.dart';
import 'steps/step_summary.dart';

const _stepLabels = [
  'Conta',
  'Categorias',
  'Raio',
  'Localização',
  'Foto',
  'Descrição',
  'Documentos',
  'Disponibilidade',
  'Conclusão',
];

const _stepWidgets = [
  StepAccount(),
  StepCategories(),
  StepRadius(),
  StepLocation(),
  StepPhoto(),
  StepDescription(),
  StepDocumentation(),
  StepAvailability(),
  StepSummary(),
];

class ProfessionalOnboardingWizardPage extends ConsumerStatefulWidget {
  const ProfessionalOnboardingWizardPage({super.key});

  @override
  ConsumerState<ProfessionalOnboardingWizardPage> createState() =>
      _ProfessionalOnboardingWizardPageState();
}

class _ProfessionalOnboardingWizardPageState extends ConsumerState<ProfessionalOnboardingWizardPage> {
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: ref.read(professionalOnboardingProvider).currentStepIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  bool _canGoNext(ProfessionalOnboardingState state) {
    final index = state.currentStepIndex;
    final data = state.formData;
    if (index == 0) return data.name.trim().isNotEmpty && data.email.contains('@');
    if (index == 1) return data.categoryIds.isNotEmpty;
    if (index == 3) return data.location.trim().isNotEmpty;
    return true;
  }

  void _handleNext(ProfessionalOnboardingState state) {
    final isLastStep = state.currentStepIndex == kProfessionalOnboardingStepCount - 1;
    if (isLastStep) {
      ref.read(professionalOnboardingProvider.notifier).reset();
      context.go('/registo-profissional/enviado');
      return;
    }
    ref.read(professionalOnboardingProvider.notifier).goNext();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(professionalOnboardingProvider);
    final isFirstStep = state.currentStepIndex == 0;
    final isLastStep = state.currentStepIndex == kProfessionalOnboardingStepCount - 1;

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
          onPressed: isFirstStep ? null : () => ref.read(professionalOnboardingProvider.notifier).goBack(),
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
        physics: const NeverScrollableScrollPhysics(),
        children: _stepWidgets,
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _canGoNext(state) ? () => _handleNext(state) : null,
            child: Text(isLastStep ? 'Concluir registo' : 'Continuar'),
          ),
        ),
      ),
    );
  }
}
