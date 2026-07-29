'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import { WizardShell } from '@/components/wizard';
import type { ApiError } from '@/services/api';
import { REQUEST_SERVICE_STEPS } from '../constants/steps';
import { useRequestServiceStore } from '../store/use-request-service-store';
import { createServiceRequest, publishServiceRequest } from '../services/requests-api';
import { StepCategory } from './steps/step-category';
import { StepDetails } from './steps/step-details';
import { StepPhotos } from './steps/step-photos';
import { StepLocation } from './steps/step-location';
import { StepUrgency } from './steps/step-urgency';
import { StepBudget } from './steps/step-budget';
import { StepSummary } from './steps/step-summary';
import { StepPublish } from './steps/step-publish';
import { RequestPublished } from './request-published';
import { DESCRIPTION_MIN_LENGTH } from './steps/step-details';

const STEP_COMPONENTS: ComponentType[] = [
  StepCategory,
  StepDetails,
  StepPhotos,
  StepLocation,
  StepUrgency,
  StepBudget,
  StepSummary,
  StepPublish,
];

const lastStepIndex = REQUEST_SERVICE_STEPS.length - 1;

export function RequestServiceWizard() {
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const currentStepIndex = useRequestServiceStore((state) => state.currentStepIndex);
  const formData = useRequestServiceStore((state) => state.formData);
  const goNext = useRequestServiceStore((state) => state.goNext);
  const goBack = useRequestServiceStore((state) => state.goBack);
  const reset = useRequestServiceStore((state) => state.reset);

  if (isPublished) {
    return <RequestPublished />;
  }

  const isLastStep = currentStepIndex === lastStepIndex;
  const StepComponent = STEP_COMPONENTS[currentStepIndex]!;

  const isNextDisabled =
    (currentStepIndex === 0 && !formData.categoryId) ||
    (currentStepIndex === 1 && formData.description.trim().length < DESCRIPTION_MIN_LENGTH) ||
    (currentStepIndex === 3 && formData.location.trim().length < 3) ||
    (currentStepIndex === 4 && !formData.urgency);

  async function handleNext() {
    if (isLastStep) {
      setSubmitError(null);
      setIsSubmitting(true);
      try {
        // Requer conta (RequireAuth já garante isto ao nível da página) —
        // cria o pedido como rascunho e publica-o de imediato, o que
        // dispara o matching de profissionais elegíveis no backend.
        const created = await createServiceRequest({
          categoryId: formData.categoryId!,
          description: formData.description,
          photoUrls: formData.photoUrls,
          location: formData.location,
          latitude: formData.latitude ?? undefined,
          longitude: formData.longitude ?? undefined,
          urgency: formData.urgency!,
          budget: formData.budget && !Number.isNaN(Number(formData.budget)) ? Number(formData.budget) : undefined,
        });
        await publishServiceRequest(created.id);
        setIsPublished(true);
        reset();
      } catch (err) {
        setSubmitError((err as ApiError).message ?? 'Não foi possível publicar o pedido. Tenta novamente.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    goNext();
  }

  return (
    <WizardShell
      steps={REQUEST_SERVICE_STEPS}
      currentStepIndex={currentStepIndex}
      onBack={goBack}
      onNext={handleNext}
      exitHref="/"
      nextLabel={isLastStep ? 'Publicar pedido' : 'Continuar'}
      isNextDisabled={isNextDisabled}
      isSubmitting={isSubmitting}
    >
      {submitError && isLastStep ? (
        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</p>
      ) : null}
      <StepComponent />
    </WizardShell>
  );
}
