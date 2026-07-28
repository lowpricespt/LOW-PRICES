'use client';

import { useState } from 'react';
import { WizardShell } from '@/components/wizard';
import { useAuth } from '@/providers/auth-provider';
import type { ApiError } from '@/services/api';
import { updateProfessionalCategories } from '../services/professional-onboarding-api';
import { PROFESSIONAL_ONBOARDING_STEPS } from '../constants/steps';
import { StepAccount } from './steps/step-account';
import { StepCategories } from './steps/step-categories';
import { StepRadius } from './steps/step-radius';
import { StepLocation } from './steps/step-location';
import { StepPhoto } from './steps/step-photo';
import { StepDescription } from './steps/step-description';
import { StepDocumentation } from './steps/step-documentation';
import { StepAvailability } from './steps/step-availability';
import { StepConclusion } from './steps/step-conclusion';
import { OnboardingSubmitted } from './onboarding-submitted';

const lastStepIndex = PROFESSIONAL_ONBOARDING_STEPS.length - 1;

export function ProfessionalOnboardingWizard() {
  const { register } = useAuth();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Passo 1 (Conta) e Passo 2 (Categorias) já estão ligados ao backend —
  // são os únicos com endpoint pronto e cujo dado é indispensável para o
  // matching funcionar (ver MatchingService). Os restantes passos
  // (localização, raio, documentos, portefólio, etc.) continuam visuais
  // até o Perfil do Especialista ser construído por completo.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isSubmittingCategories, setIsSubmittingCategories] = useState(false);

  if (isSubmitted) {
    return <OnboardingSubmitted />;
  }

  const isLastStep = currentStepIndex === lastStepIndex;
  const isAccountStep = currentStepIndex === 0;
  const isCategoriesStep = currentStepIndex === 1;

  function toggleCategory(categoryId: string) {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  }

  async function handleNext() {
    if (isAccountStep) {
      setAccountError(null);

      if (!name.trim() || !email.includes('@') || password.length < 8) {
        setAccountError('Preenche o nome, um email válido e uma palavra-passe com pelo menos 8 caracteres.');
        return;
      }

      setIsSubmittingAccount(true);
      try {
        await register({ name, email, password, role: 'PROFESSIONAL' });
        setCurrentStepIndex((index) => Math.min(index + 1, lastStepIndex));
      } catch (err) {
        setAccountError((err as ApiError).message ?? 'Não foi possível criar a conta. Tenta novamente.');
      } finally {
        setIsSubmittingAccount(false);
      }
      return;
    }

    if (isCategoriesStep) {
      setCategoriesError(null);

      if (selectedCategories.length === 0) {
        setCategoriesError('Escolhe pelo menos uma categoria para continuares — é o que decide que pedidos vês.');
        return;
      }

      setIsSubmittingCategories(true);
      try {
        // Grava já (não espera pelo fim do wizard) — se a pessoa abandonar
        // a meio dos passos seguintes (ainda visuais), as categorias já
        // ficam guardadas a sério, não se perdem.
        await updateProfessionalCategories(selectedCategories);
        setCurrentStepIndex((index) => Math.min(index + 1, lastStepIndex));
      } catch (err) {
        setCategoriesError((err as ApiError).message ?? 'Não foi possível guardar as categorias. Tenta novamente.');
      } finally {
        setIsSubmittingCategories(false);
      }
      return;
    }

    if (isLastStep) {
      setIsSubmitted(true);
      return;
    }

    setCurrentStepIndex((index) => Math.min(index + 1, lastStepIndex));
  }

  function handleBack() {
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  }

  return (
    <WizardShell
      steps={PROFESSIONAL_ONBOARDING_STEPS}
      currentStepIndex={currentStepIndex}
      onBack={handleBack}
      onNext={handleNext}
      exitHref="/"
      nextLabel={isLastStep ? 'Concluir registo' : 'Continuar'}
      isSubmitting={isSubmittingAccount || isSubmittingCategories}
    >
      {isAccountStep && (
        <StepAccount
          name={name}
          email={email}
          password={password}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          error={accountError}
        />
      )}
      {isCategoriesStep && (
        <StepCategories selected={selectedCategories} onToggle={toggleCategory} error={categoriesError} />
      )}
      {currentStepIndex === 2 && <StepRadius />}
      {currentStepIndex === 3 && <StepLocation />}
      {currentStepIndex === 4 && <StepPhoto />}
      {currentStepIndex === 5 && <StepDescription />}
      {currentStepIndex === 6 && <StepDocumentation />}
      {currentStepIndex === 7 && <StepAvailability />}
      {currentStepIndex === 8 && <StepConclusion />}
    </WizardShell>
  );
}