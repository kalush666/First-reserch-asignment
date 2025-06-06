import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signin(dto: AuthDto) {
    return '';
  }

  async signup(dto: AuthDto) {
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
        // Create base user
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
