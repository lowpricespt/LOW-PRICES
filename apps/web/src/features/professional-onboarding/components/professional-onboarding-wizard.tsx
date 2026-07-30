'use client';

import { useState } from 'react';
import { WizardShell } from '@/components/wizard';
import { useAuth } from '@/providers/auth-provider';
import type { ApiError } from '@/services/api';
import { updateProfessionalProfileRequest } from '@/features/profile/services/professional-profile-api';
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

// Tem de bater certo com RegisterDto/IsStrongPassword (backend) — validar
// aqui à frente evita chegar ao fim do passo só para descobrir, via erro
// 400, que falta uma maiúscula ou um número na password.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export function ProfessionalOnboardingWizard() {
  const { register } = useAuth();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Conta e Categorias gravam logo que se avança de cada um desses dois
  // passos (dados indispensáveis para o matching — ver MatchingService).
  // Raio/Localização/Descrição/Disponibilidade ficam só em estado local
  // até ao fim do assistente, e são gravados todos de uma vez com
  // `updateProfessionalProfileRequest` no último passo — o mesmo perfil
  // pode depois ser editado a qualquer momento em "Perfil".
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isSubmittingCategories, setIsSubmittingCategories] = useState(false);

  const [radiusKm, setRadiusKm] = useState(15);
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude?: number; longitude?: number }>({});
  const [description, setDescription] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  function toggleDay(dayId: string) {
    setAvailableDays((prev) => (prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]));
  }

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

      if (name.trim().length < 2 || !EMAIL_REGEX.test(email)) {
        setAccountError('Preenche o nome e um email válido.');
        return;
      }
      if (password.length < 8 || !PASSWORD_REGEX.test(password)) {
        setAccountError('A palavra-passe deve ter pelo menos 8 caracteres, com maiúsculas, minúsculas e um número.');
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
      setProfileError(null);
      setIsSubmittingProfile(true);
      try {
        await updateProfessionalProfileRequest({
          bio: description.trim() || undefined,
          serviceRadiusKm: radiusKm,
          location: location.trim() || undefined,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          availableDays,
        });
        setIsSubmitted(true);
      } catch (err) {
        setProfileError((err as ApiError).message ?? 'Não foi possível guardar o perfil. Tenta novamente.');
      } finally {
        setIsSubmittingProfile(false);
      }
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
      isSubmitting={isSubmittingAccount || isSubmittingCategories || isSubmittingProfile}
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
      {currentStepIndex === 2 && <StepRadius radiusKm={radiusKm} onRadiusChange={setRadiusKm} />}
      {currentStepIndex === 3 && (
        <StepLocation
          location={location}
          onLocationChange={setLocation}
          onPlaceSelected={(place) => setCoordinates({ latitude: place.latitude ?? undefined, longitude: place.longitude ?? undefined })}
        />
      )}
      {currentStepIndex === 4 && <StepPhoto />}
      {currentStepIndex === 5 && <StepDescription description={description} onDescriptionChange={setDescription} />}
      {currentStepIndex === 6 && <StepDocumentation />}
      {currentStepIndex === 7 && <StepAvailability selectedDays={availableDays} onToggleDay={toggleDay} />}
      {currentStepIndex === 8 && <StepConclusion error={profileError} />}
    </WizardShell>
  );
}