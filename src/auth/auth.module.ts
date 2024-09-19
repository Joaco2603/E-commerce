import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtHttpDefaultStrategy } from './strategies/jwt-http-default.strategy';


import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from 'src/users/users.module';

import { strategiesNames } from './enum/strategies-names';


@Module({
  providers: [AuthResolver, AuthService, JwtHttpDefaultStrategy],
  imports: [
    ConfigModule,
    PassportModule.register({ default: strategiesNames.jwt_http }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => (
        {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '4h',
          }
        }
      )
    }),
    UsersModule,
  ],
  exports: [
    JwtHttpDefaultStrategy, PassportModule, JwtModule
  ],
})
export class AuthModule { }
