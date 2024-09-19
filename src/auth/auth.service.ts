import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthResponse } from './types/auth-response.type';
import { SignUpInput, LoginInput } from './dto/inputs/index';

import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }


  private async generateJwt(id: string) {
    return await this.jwtService.sign({ id });
  }


  async revalidateToken(user: User) {
    const token = await this.generateJwt(user.id);
    return {
      user,
      token
    }
  }


  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);

    if (!user.isActive)
      throw new UnauthorizedException(`User is inactive, talk with an admin`);

    delete user.password;

    return user;
  }

  async signup(signUpInput: SignUpInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signUpInput);

    const token = await this.generateJwt(user.id);

    return { token, user };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;

    const user = await this.usersService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Email/Password');
    }

    const token = await this.generateJwt(user.id);

    return {
      token,
      user,
    }
  }
}
