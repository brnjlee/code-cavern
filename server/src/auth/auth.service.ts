import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateFromEmail } from 'unique-username-generator';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dtos/auth.dto';
import { parseCookies } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async signIn(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.findUserByEmail(user.email);

    if (!userExists) {
      return this.registerUser(user);
    }

    return this.generateJwt({
      sub: userExists.id,
      email: userExists.email,
    });
  }

  async registerUser(user: RegisterUserDto) {
    try {
      const newUser = await this.prisma.user.create({ data: user });
      // newUser.username = generateFromEmail(user.email, 5);

      return this.generateJwt({
        sub: newUser.id,
        email: newUser.email,
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findUserByEmail(email) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    return user;
  }

  async validateJWT(req) {
    if (!req?.headers?.cookie) {
      return null;
    }
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies['next-auth.session-token'];
    return this.jwtService.verify(token, {
      secret: this.configService.get('jwt.secret'),
    });
    // const user = await this.prisma.user.findUnique({
    //   where: { email: payload.email },
    // });
  }
}
