import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../database/entities/user.entity';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: '$2b$10$abcdefghijklmnopqrstuv', // hashed password
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: null,
    role: UserRole.USER,
    emailVerified: false,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    isBanned: false,
    banReason: null,
    parentUserId: null,
    parentUser: null,
    subUsers: [],
    subscriptionPlan: 'free',
    subscriptionStartDate: new Date(),
    subscriptionEndDate: null,
    subscriptionActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.email).toBe(loginDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for banned user', async () => {
      const bannedUser = { ...mockUser, isBanned: true, banReason: 'Violation' };
      mockUserRepository.findOne.mockResolvedValue(bannedUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '123456789',
      };

      mockUserRepository.findOne.mockResolvedValue(null); // No existing user
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.email).toBe(mockUser.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'different-password',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user profile', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(mockUser.id);

      expect(result).toHaveProperty('email');
      expect(result.email).toBe(mockUser.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getCurrentUser('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
