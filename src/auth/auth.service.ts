import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Auth } from './decorators/auth.decorator';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      // extracting password for encryption
      const { password, ...userData } = createUserDto

      // user created on memory, not to database
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      // this takes the user created on memory and saves it to database
      const savedUser = await this.userRepository.save(user);

      // return everything except the password
      return {
        ...user,
        password: undefined,
        token: this.getJwtToken({ id: savedUser.id })
      };

    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }


  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true }
    })

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return {
      ...user,
      password: undefined,
      token: this.getJwtToken({ id: user.id })
    }
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      password: undefined,
      token: this.getJwtToken({ id: user.id })
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }


  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
