'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import type { ApiError } from '@/services/api';
import { updateProfessionalCategories } from '../services/professional-onboarding-api';
import { StepCategories } from './steps/step-categories';

/**
 * Ecrã de destino quando o backend devolve `requiresCategorySelection`
 * no callback do Google (ver AuthController.googleCallback) — cobre o
 * Especialista que criou conta via Google e nunca passou pelo wizard de
 * registo, e também qualquer conta PROFESSIONAL mais antiga sem
 * categorias. Sem isto, a conta fica aprovável mas invisível ao
 * matching para sempre (ProfessionalCategory vazio).
 */
export function CompleteCategories() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggle(categoryId: string) {
    setSelected((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
  }

  async function handleSubmit() {
    setError(null);
    if (selected.length === 0) {
      setError('Escolhe pelo menos uma categoria para continuares.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfessionalCategories(selected);
      router.push('/dashboard/profissional');
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível guardar as categorias. Tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <StepCategories selected={selected} onToggle={toggle} error={error} />
      <Button size="lg" className="mt-8 w-full" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'A guardar…' : 'Continuar para o painel'}
      </Button>
    </div>
  );
}
