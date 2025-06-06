import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { UserRole } from '@prisma/client';
import { SigninDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signin(dto: SigninDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: {
          doctor: true,
          patient: true,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      const passwordMatches = await argon.verify(user.password, dto.password);

      if (!passwordMatches) {
        throw new BadRequestException('Invalid credentials');
      }

      return {
        message: 'Signin successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          role: user.role,
          doctor: user.role === UserRole.DOCTOR ? user.doctor : null,
          patient: user.role === UserRole.PATIENT ? user.patient : null,
        },
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
          select: {
            id: true,
            email: true,
            name: true,
            age: true,
            role: true,
            doctor: {
              select: {
                speciality: true,
              },
            },
            patient: {
              select: {
                allergies: true,
                medications: true,
              },
            },
          },
        });
      });

      return {
        message: 'User created successfully',
        user: result,
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
      throw error;
    }
  }
}
