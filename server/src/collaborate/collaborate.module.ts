import { Module } from '@nestjs/common';
import { CollaborateGateway } from './collaborate.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { HocusPocusService } from './hocuspocus.service';

@Module({
  providers: [CollaborateGateway, HocusPocusService],
  imports: [PrismaModule, AuthModule],
})
export class CollaborateModule {}
