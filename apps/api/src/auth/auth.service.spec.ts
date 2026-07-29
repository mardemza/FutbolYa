import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../database/entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const users: UserEntity[] = [];

  const repo = {
    findOne: jest.fn(async ({ where }: { where: { email?: string; id?: string } }) => {
      if (where.email) {
        return users.find((u) => u.email === where.email) ?? null;
      }
      if (where.id) {
        return users.find((u) => u.id === where.id) ?? null;
      }
      return null;
    }),
    create: jest.fn((data: Partial<UserEntity>) => data as UserEntity),
    save: jest.fn(async (data: UserEntity) => {
      const saved = {
        ...data,
        id: data.id ?? 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserEntity;
      users.push(saved);
      return saved;
    }),
  };

  beforeEach(async () => {
    users.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: repo,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('registers a new user and returns token', async () => {
    const result = await service.register({
      email: 'a@test.com',
      password: 'password123',
      displayName: 'Ana',
    });

    expect(result.accessToken).toBe('test-token');
    expect(result.user.email).toBe('a@test.com');
    expect(result.user.displayName).toBe('Ana');
    expect(users[0].passwordHash).not.toBe('password123');
  });

  it('rejects duplicate email', async () => {
    await service.register({
      email: 'a@test.com',
      password: 'password123',
    });

    await expect(
      service.register({
        email: 'a@test.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    users.push({
      id: 'user-1',
      email: 'a@test.com',
      passwordHash,
      displayName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.login({
      email: 'a@test.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('test-token');
  });

  it('rejects invalid login', async () => {
    await expect(
      service.login({
        email: 'missing@test.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
