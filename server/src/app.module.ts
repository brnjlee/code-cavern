import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CollaborateModule } from './collaborate/collaborate.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule,
    UsersModule,
    CollaborateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
