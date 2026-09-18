import { RegisterDto } from '@/auth/dto/register.dto';
import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterOAuthDto extends OmitType(RegisterDto, [
  'email',
  'password',
] as const) {
  @IsString()
  @IsNotEmpty()
  pendingId: string;
}
