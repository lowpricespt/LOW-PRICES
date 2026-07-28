import { CalendarDays } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

// Inclui "Calendário" como vista dentro desta mesma página (ver
// docs/architecture/AGENDA_ARCHITECTURE.md) — não é uma rota à parte.
export default function ProfessionalAgendaPage() {
  return (
    <div>
      <DashboardPageHeader title="Agenda" description="Disponibilidade, marcações e bloqueios." />
      <StubSection title="Agenda" icon={CalendarDays} />
    </div>
  );
}
