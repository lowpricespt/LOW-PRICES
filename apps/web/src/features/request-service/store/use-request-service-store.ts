import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { REQUEST_SERVICE_STEPS, type UrgencyId } from '../constants/steps';

export interface RequestServiceFormData {
  categoryId: string | null;
  description: string;
  photoCount: number;
  location: string;
  urgency: UrgencyId | null;
  budget: string;
}

interface RequestServiceState {
  currentStepIndex: number;
  formData: RequestServiceFormData;
  goToStep: (index: number) => void;
  goNext: () => void;
  goBack: () => void;
  updateFormData: (partial: Partial<RequestServiceFormData>) => void;
  reset: () => void;
}

const initialFormData: RequestServiceFormData = {
  categoryId: null,
  description: '',
  photoCount: 0,
  location: '',
  urgency: null,
  budget: '',
};

const lastStepIndex = REQUEST_SERVICE_STEPS.length - 1;

export const useRequestServiceStore = create<RequestServiceState>()(
  persist(
    (set) => ({
      currentStepIndex: 0,
      formData: initialFormData,
      goToStep: (index) =>
        set({ currentStepIndex: Math.max(0, Math.min(index, lastStepIndex)) }),
      goNext: () =>
        set((state) => ({
          currentStepIndex: Math.min(state.currentStepIndex + 1, lastStepIndex),
        })),
      goBack: () =>
        set((state) => ({
          currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
        })),
      updateFormData: (partial) =>
        set((state) => ({ formData: { ...state.formData, ...partial } })),
      reset: () => set({ currentStepIndex: 0, formData: initialFormData }),
    }),
    {
      // Guardado no browser: permite ao cliente sair a meio e continuar depois,
      // sem perder o que já preencheu (requisito explícito do fluxo).
      name: 'low-prices:request-service',
    },
  ),
);
