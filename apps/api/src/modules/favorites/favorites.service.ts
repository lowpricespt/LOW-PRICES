import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FavoritesRepository } from './favorites.repository';

@Injectable()
export class FavoritesService {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async add(clientProfileId: string, professionalProfileId: string): Promise<void> {
    const exists = await this.favoritesRepository.professionalExists(professionalProfileId);
    if (!exists) throw new NotFoundException('Profissional não encontrado.');

    // Idempotente de propósito: favoritar duas vezes o mesmo profissional
    // não é um erro do utilizador, é só um clique repetido na UI.
    const existing = await this.favoritesRepository.findByClientAndProfessional(clientProfileId, professionalProfileId);
    if (existing) return;

    try {
      await this.favoritesRepository.create(clientProfileId, professionalProfileId);
    } catch {
      throw new BadRequestException('Não foi possível guardar este favorito.');
    }
  }

  async remove(clientProfileId: string, professionalProfileId: string): Promise<void> {
    await this.favoritesRepository.remove(clientProfileId, professionalProfileId);
  }

  findMine(clientProfileId: string) {
    return this.favoritesRepository.findManyByClient(clientProfileId);
  }
}
