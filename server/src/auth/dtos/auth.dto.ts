import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  provider: string;

  @ApiProperty({ required: false })
  providerId: string;

  @ApiProperty({ required: false })
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  password: string;

  @ApiProperty()
  avatar: string;
}
