import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Post } from './entities/post.entity';
import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const newUser = this.usersRepository.create(createUserDto);

    return this.usersRepository.save(newUser); //sejvamo instancu user entity klase u db
  }

  findAll() {
    return this.usersRepository.find({ relations: ['profile', 'posts'] }); //nazivi kakvi su u entity kod relatinshipsa
    // return this.usersRepository.find();
  }

  findOne(id: number) {
    // return this.usersRepository.findOne(id); // u typeorm@0.3 zamijenjen: https://stackoverflow.com/questions/71548592/nest-js-typeorm-cannot-use-findone-properly
    return this.usersRepository.findOneBy({ id });
  }

  //   async findOne(id: number): Promise<Post> {
  //     const user = await this.usersRepository.findOne({
  //       where: { id },
  //     });
  //     return user;
  //   }

  async update(id: number, updateUserDto: UpdateUserDto) {
    //prvo query pa onda update s mutacijom
    // const user = await this.findOne(id);

    // user.name = updateUserDto.name;
    // return this.usersRepository.save(user);

    return this.usersRepository.update({ id }, { ...updateUserDto });
  }

  async remove(id: number) {
    return this.usersRepository.delete(id);

    //ili ako zelimo da vracen bude obrisan objekt a ne podaci o brisanju opet radimo query prije deletea:
    // const user = await this.findOne(id);

    // return this.usersRepository.remove(user);
  }

  //bolje bi bilo u novi service
  async createUserProfile(id: number, createProfileDto: CreateProfileDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user)
      throw new HttpException(
        'User not found. Cannot create profile',
        HttpStatus.BAD_REQUEST,
      );

    const newProfile = this.profileRepository.create(createProfileDto);
    const savedProfile = await this.profileRepository.save(newProfile);

    //gornji sloj je dosta za kreiranje profila, ali sada taj profil moramo pridodati i korisniku (novi atribut/stupac u user tablici - profile)
    user.profile = savedProfile;
    return this.usersRepository.save(user);
  }

  async createPost(id: number, createPostDto: CreatePostDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user)
      throw new HttpException(
        'User not found. Cannot create profile',
        HttpStatus.BAD_REQUEST,
      );

    const newPost = this.postRepository.create({
      //ovako je sigurnije da taj post bude od traženog usera
      ...createPostDto,
      user,
    });

    return this.postRepository.save(newPost);
  }
}
