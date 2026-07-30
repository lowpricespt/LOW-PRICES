export interface StepDescriptionProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

export function StepDescription({ description, onDescriptionChange }: StepDescriptionProps) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Fala-nos da tua experiência
      </h1>
      <p className="mt-2 text-muted-foreground">
        Isto aparece no teu perfil público — destaca anos de experiência e especialidades.
      </p>

      <textarea
        rows={6}
        maxLength={1000}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Ex.: Canalizador há 12 anos, especializado em reparações urgentes..."
        className="mt-6 w-full resize-none rounded-xl border border-input bg-transparent p-4 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
