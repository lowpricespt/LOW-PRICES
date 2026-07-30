'use client';

export interface StepRadiusProps {
  radiusKm: number;
  onRadiusChange: (radiusKm: number) => void;
}

export function StepRadius({ radiusKm, onRadiusChange }: StepRadiusProps) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Até onde estás disposto a deslocar-te?
      </h1>
      <p className="mt-2 text-muted-foreground">
        Guardado no teu perfil para quando a filtragem por distância real for ativada — por agora, a
        categoria escolhida é o que decide que pedidos vês.
      </p>

      <div className="mt-8 rounded-xl border border-border p-6 text-center">
        <span className="font-display text-4xl font-semibold text-primary">{radiusKm} km</span>
        <input
          type="range"
          min={1}
          max={150}
          value={radiusKm}
          onChange={(event) => onRadiusChange(Number(event.target.value))}
          className="mt-6 w-full accent-primary"
          aria-label="Raio de atuação em quilómetros"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>1 km</span>
          <span>150 km</span>
        </div>
      </div>
    </div>
  );
}
