import { UserGender } from '../../users/enums/user.enums';

export interface DemoSkillSeedData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
}

export interface DemoUserSeedData {
  email: string;
  name: string;
  birthdate: Date;
  gender: UserGender;
  city: string;
  avatar: string;
  about: string;
  wantToLearnCategories: string[];
  skill: DemoSkillSeedData;
}

export const demoUserPassword = process.env.DEMO_USER_PASSWORD ?? 'Demo12345';

export const demoUsersSeedData: DemoUserSeedData[] = [
  {
    email: 'ivan.petrov@mail.ru',
    name: 'Иван Петров',
    birthdate: new Date('1990-03-15'),
    gender: UserGender.MALE,
    city: 'Санкт-Петербург',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    about:
      'Люблю ритм, кофе по утрам и людей, которые не боятся пробовать новое',
    wantToLearnCategories: ['Иностранные языки', 'Здоровье и лайфстайл'],
    skill: {
      title: 'Игра на барабанах',
      description:
        'Играю на барабанах больше 10 лет. Научу основам техники, любимым ритмам, разбору песен и импровизации.',
      category: 'Творчество и искусство',
      subcategory: 'Музыка и звук',
      images: [
        'https://picsum.photos/seed/skill-1-1/400/300',
        'https://picsum.photos/seed/skill-1-2/400/300',
      ],
    },
  },
  {
    email: 'anna.sokolova@gmail.com',
    name: 'Анна Соколова',
    birthdate: new Date('1995-07-22'),
    gender: UserGender.FEMALE,
    city: 'Москва',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    about:
      'Фотограф и путешественница. Верю, что каждый момент заслуживает красивого кадра',
    wantToLearnCategories: ['Бизнес и карьера', 'Иностранные языки'],
    skill: {
      title: 'Портретная фотография',
      description:
        'Профессионально занимаюсь портретной съёмкой пять лет. Научу работать со светом, выстраивать кадр и помогать людям чувствовать себя уверенно перед камерой.',
      category: 'Творчество и искусство',
      subcategory: 'Фотография',
      images: [
        'https://picsum.photos/seed/skill-2-1/400/300',
        'https://picsum.photos/seed/skill-2-2/400/300',
      ],
    },
  },
  {
    email: 'dmitry.volkov@yandex.ru',
    name: 'Дмитрий Волков',
    birthdate: new Date('1988-11-05'),
    gender: UserGender.MALE,
    city: 'Екатеринбург',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    about:
      'Предприниматель в третьем запуске. Люблю спорт и честные разговоры о деньгах',
    wantToLearnCategories: ['Творчество и искусство', 'Образование и развитие'],
    skill: {
      title: 'Запуск бизнеса с нуля',
      description:
        'Трижды прошёл путь от идеи до работающего бизнеса. Помогу разобраться с бизнес-моделью, первыми продажами и типичными ошибками на старте.',
      category: 'Бизнес и карьера',
      subcategory: 'Предпринимательство',
      images: [
        'https://picsum.photos/seed/skill-3-1/400/300',
        'https://picsum.photos/seed/skill-3-2/400/300',
      ],
    },
  },
];
