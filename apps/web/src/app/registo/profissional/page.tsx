import type { Metadata } from 'next';
import { ProfessionalOnboardingWizard } from '@/features/professional-onboarding/components';

export const metadata: Metadata = {
  title: 'Registo de profissional',
};

export default function ProfessionalOnboardingPage() {
  return <ProfessionalOnboardingWizard />;
}
