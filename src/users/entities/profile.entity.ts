import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  //to ne mora biti tu,ali onda bi veza bila unidirectional a ne bidirecitonal i ne bi se mogli izvršavati neki upiti
  //kao što je npr. dobiti koji je user iz profile tablice, dok bi suprotno bilo moguce
  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
