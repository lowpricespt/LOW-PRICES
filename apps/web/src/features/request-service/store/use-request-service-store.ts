import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { REQUEST_SERVICE_STEPS, type UrgencyId } from '../constants/steps';

export interface RequestServiceFormData {
  categoryId: string | null;
  description: string;
  photoUrls: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
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
  photoUrls: [],
  location: '',
  latitude: null,
  longitude: null,
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
      // BUG CRÍTICO corrigido aqui: `formData` mudou de forma (photoCount
      // -> photoUrls) sem isto — qualquer utilizador com um rascunho
      // guardado de antes desta mudança tinha `formData.photoUrls`
      // undefined, e `StepPhotos`/`StepSummary` rebentavam ao ler
      // `.length` disso (ecrã de erro genérico, wizard inutilizável).
      // Subir a versão força um reset limpo para quem tiver uma forma
      // antiga guardada — perder um rascunho a meio é muito menos mau do
      // que a app rebentar. Sempre que `RequestServiceFormData` mudar de
      // forma outra vez (campo removido/renomeado), subir esta versão de
      // novo.
      version: 1,
      migrate: (persistedState, version) => {
        if (version < 1) {
          return { currentStepIndex: 0, formData: initialFormData };
        }
        return persistedState as RequestServiceState;
      },
    },
  ),
);
