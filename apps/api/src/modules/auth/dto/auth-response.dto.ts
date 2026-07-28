import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  accessToken!: string;
  /**
   * Presente na resposta para o Mobile poder guardá-lo no secure storage.
   * O Website ignora este campo — a sessão do browser usa o cookie
   * httpOnly definido na mesma resposta, nunca este valor em JSON.
   */
  refreshToken!: string;
  user!: UserResponseDto;
}
