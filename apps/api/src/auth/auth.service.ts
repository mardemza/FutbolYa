import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { LoginDto, RegisterDto } from './auth.dto';

export type PublicUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto): Promise<AuthResponse> {
    const email = payload.email.trim().toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email,
        passwordHash,
        displayName: payload.displayName?.trim() || null,
      }),
    );

    return this.toAuthResponse(user);
  }

  async login(payload: LoginDto): Promise<AuthResponse> {
    const email = payload.email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(payload.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.toAuthResponse(user);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid token subject');
    }
    return this.toPublicUser(user);
  }

  private toAuthResponse(user: UserEntity): AuthResponse {
    return {
      user: this.toPublicUser(user),
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
    };
  }

  private toPublicUser(user: UserEntity): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}
