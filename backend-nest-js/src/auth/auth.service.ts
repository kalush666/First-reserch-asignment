import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { UserRole } from '@prisma/client';
import { SigninDto, SignupDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: SigninDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: {
          doctor: {
            select: {
              id: true,
              speciality: true,
            },
          },
          patient: {
            select: {
              id: true,
              allergies: true,
              medications: true,
            },
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      const passwordMatches = await argon.verify(user.password, dto.password);

      if (!passwordMatches) {
        throw new BadRequestException('Invalid credentials');
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);
      const { password, ...userWithoutPassword } = user;

      return {
        message: 'Signin successful',
        user: {
          ...userWithoutPassword,
          doctor: user.role === UserRole.DOCTOR ? user.doctor : null,
          patient: user.role === UserRole.PATIENT ? user.patient : null,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('An error occurred during signin');
    }
  }

  async signup(dto: SignupDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      if (dto.role === UserRole.DOCTOR && !dto.speciality) {
        throw new BadRequestException('Speciality is required for doctors');
      }

      const hash = await argon.hash(dto.password);

      const result = await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            email: dto.email,
            password: hash,
            name: dto.name,
            age: dto.age,
            role: dto.role,
          },
        });

        if (dto.role === UserRole.DOCTOR) {
          await prisma.doctor.create({
            data: {
              userId: user.id,
              speciality: dto.speciality!,
            },
          });
        } else if (dto.role === UserRole.PATIENT) {
          await prisma.patient.create({
            data: {
              userId: user.id,
              allergies: dto.allergies || [],
              medications: dto.medications || [],
            },
          });
        }

        return await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            doctor: {
              select: {
                id: true,
                speciality: true,
              },
            },
            patient: {
              select: {
                id: true,
                allergies: true,
                medications: true,
              },
            },
          },
        });
      });

      const tokens = await this.getTokens(
        result!.id,
        result!.email,
        result!.role,
      );
      const { password, ...userWithoutPassword } = result!;

      return {
        message: 'User created successfully',
        user: {
          ...userWithoutPassword,
          doctor: result!.role === UserRole.DOCTOR ? result!.doctor : null,
          patient: result!.role === UserRole.PATIENT ? result!.patient : null,
        },
        ...tokens,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException('An error occurred during signup');
    }
  }

  async getTokens(userId: number, email: string, role: UserRole) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const jwtSecret = this.config.get('JWT_SECRET');
    const jwtRefreshSecret =
      this.config.get('JWT_REFRESH_SECRET') || jwtSecret + '_refresh';

    if (!jwtSecret) {
      throw new BadRequestException('JWT configuration is missing');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const jwtRefreshSecret =
        this.config.get('JWT_REFRESH_SECRET') ||
        this.config.get('JWT_SECRET') + '_refresh';

      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: jwtRefreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return this.getTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
