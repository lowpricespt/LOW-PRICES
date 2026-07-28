import type { SVGProps } from 'react';

export interface LogoMarkProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Símbolo oficial da Low Prices.
 *
 * Conceito: o traço do "L" (haste vertical + pé horizontal) e o "P"
 * (a mesma haste + laço superior) partilham uma única haste central —
 * não são duas letras coladas, é uma letra a nascer da outra. O laço
 * do P sugere também um alfinete de localização, ligando o símbolo ao
 * próprio negócio (profissionais que se deslocam até ao cliente).
 *
 * Desenhado como traço monoline (stroke) para funcionar bem em
 * qualquer tamanho, do favicon 16px ao ícone de app 512px.
 */
export function LogoMark({ size = 32, className, ...props }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Low Prices"
      className={className}
      {...props}
    >
      <rect width="64" height="64" rx="16" className="fill-primary" />
      <path d="M24 46 V17" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M24 17 C34 17 40 21 40 27 C40 33 34 36.5 24 36.5"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 46 H42" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
