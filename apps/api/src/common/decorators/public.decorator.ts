import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/// Sem isto, o JwtAuthGuard global bloquearia TODAS as rotas por
/// omissão — é a postura mais segura por defeito (esquecer de proteger
/// uma rota nova é impossível; só esquecer de a marcar pública, o que é
/// um erro visível de imediato em testes, não um buraco de segurança
/// silencioso).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
