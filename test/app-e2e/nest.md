# MVC- arhitektura za pojednostavljanje rada s kompleksnim aplikacijama/hrpom koda

ideja: podijeliti veliku aplikaciju na pojedine sekcije (MVC)

Controller- odgovora za hendlanje zahtjeva i slanje odgovora, objašnjava modelu i view što da rade, nikad ne bi smio raditi s data logicom, on samo vraća zahtjev bazhirano na tome što je model odgovorio

Model- Model je odgovoran za hendlanje data logica (interkacija s db, mijenjanje podataka), nikad se ne treba paviti s zahtjevima i s hendlanjem errora

View- Kada model obradi podatke i vrati controlleru, controller šalje podatke viewu koji renderira podatke korisniku koji se brine s prezentiranjem podataka(samo template) - file koji dinamicki renderira html bazirano na tome sto controller pošalje, kada je gotov šalje tu prezentaciju kontroleru, a kontroler korisniku

\*Model i view nikad nisu u interakciji

node.js framework za kreiranje scalable server side appsa pomocu typescrivta

out of the box support za graphql i rest

slican angularu

**baziran se na Model view controlleru (MVC) kao laravel ili ruby on raiyl**
Controller- fundemental building block of framework
-hendla incoming http requeste i vracanje odgovora nazad klijentu
-controller decorator: @Controller() pa onda export class CatController{}....
-moguce imati vise kontrolera- istraziti to mozda je to trik u zadatku
A NestJS controller is basically a bunch of request handlers to process incoming requests

Provider - klasa koja sadrži dijeljenu loginku kroz aplikaciju i može se iskoristiti gdje želimo - npr- s @indjectable dekoratorm ispred jedne klase znaci da se ta klasa moze bilo gdje iskoristiti preko konstrukturo u drugoj klasi (injecta u drugu klasu) - primjer: autentifikacija i validacija
The main idea behind a Provider is that it can be injected as a dependency. In other words, objects can form relationships between each other.
to put it simply, this decorator attaches metadata to the class that make it possible for the BooksService to be managed by the Nest IOC container. In other words, it basically makes it possible for NestJS to inject this class wherever needed.
Module - omogućava organiziranje koda u manje chunkove kako bi se brže runna u serverless okruženjima (organize and lazy-load)
-Modules are a great way to isolate domain functionalities within the application

## CRUD API u 30 minuta:

    `npm i -g @nestjs/cli

    nest new nest-crud-api

    npm install --save @nestjs/typeorm typeorm mysql2

    npm run start:dev`

**instalirait thunderclienta ili postmana**

    nest g resource posts- kreira controllere, module service i CRUD kostur(controllere) automatski u par sekundi, ali nema pravu implementaciju onosno vraca random string a ne resurse - boiler plate from nest cli

- pita koji transport layer zelimo korsistiti(rest api, graphql, microservice(non-http), websockets

**baza se setapira u root fileu odnosno app.module.tsm, ali prije toga ju treba napraviti**
Izrada baze: https://dev.mysql.com/downloads/file/?id=514518
treba nam tri stvari: mysql8, visual studio 2019, te mysql for visual studio 1.2.10
lozinka:root
a za db admina user loz i user ime
kada nam u projektu dode ova lozinka znaci da smo blizu i da treba samo još kreirati bazu: ERROR [TypeOrmModule] Unable to connect to the database.
u terminal bilodje:

    `mysql -u user -p`

(user je korisnicko ime mi)

al mouce da se pojavi reska: The term 'mysql' is not recognized as the name of a cmdlet' pa treba postaviti env varijablu: https://stackoverflow.com/questions/5920136/mysql-is-not-recognised-as-an-internal-or-external-command-operable-program-or-b

    - odnosno: u system i user variable pod PAT dodati: C:\Program Files\MySQL\MySQL Server 8.0\bin
    - kreiramo db i tablicu:
    create database nest_test; use nest_test;, show tables;
    -login: `mysql -u root -p nest_test`

- kopirati s:

        import { Module } from '@nestjs/common';

        import { AppController } from './app.controller';

        import { AppService } from './app.service';

        import { PostsModule } from './posts/posts.module';

        import { TypeOrmModule } from '@nestjs/typeorm';

        import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

        import { Post } from './posts/entities/post.entity';

        // import { Book } from './library/entities/book.entity';

        // import { LibraryModule } from './library/library.module';

        const config: MysqlConnectionOptions = {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'nest_test',
        entities: [Post],
        synchronize: true,
        dropSchema: true,
        };

        @Module({
        imports: [PostsModule, TypeOrmModule.forRoot(config)],
        controllers: [AppController],
        providers: [AppService],
        })
        export class AppModule {}

### **bez ove linije nece raditi stvari u service.ts:**

     `imports: [PostsModule, TypeOrmModule.forRoot(config)]`,

obavezno `synchronize:true `koji nove entitete odmah stvori u bazi, nakon što ih dodamo u kod, kao automatska migracija, samo za dev nije preporuceno za production, dakle matcha schemu koji smo definiraili u kodu s db
-paziti na entities da se doda onaj sto smo ga stvorili
isto tako nam dekoratori koriste da kažemo typeourm što želimo da ovi stupci ili varijable budu u bazi
@PrimaryGeneratedColum() je auto inc int, ostatak je @column() za string

### **to je to od povezivanja, sada se moze ubacivati nutra table, rowsi, columnsi**

ubaceno provjeravamo s npr sow tables; i dalje table user s describe user; -poprilicno jednostavno dok je syncronice:on \*\*

ali sada treba napraviti entitet koji se sam ubaci kao tablica:
prvo u posts.module.ts dodamo u importse (moze i obrnuti redoslijed):

    imports: [TypeOrmModule.forFeature([Post])],

### **This module uses the forFeature() method to define which repositories are registered in the current scope. We need this piece of configuration to inject the repository into the service.**

onda u post.entity.ts napravimo entitet: (upisujemo dekorator, idjeve i importi se sami ucitaju

    import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

    @Entity()
    export class Post {
    @PrimaryGeneratedColumn() //auto inc int
    id: number;

    @Column() //samo pretvori tip?
    title: string;
    }

---

### **kostur je sada napravljen i mozemo dovrsiti definiranje CRUD operacija u bazu**

nacin na koji nest funkcionira su dependency injection tj sve se vrti oko njih - automatski za nas povezuje stvari bazirano na tome što provajdamo konstruktoru
sada mozemo u services: any zmijeniti s tipom "Post"

    export class PostsService {
            constructor(
            @InjectRepository(Post) private postsRepository: Repository<Post>,
            ) {}

! ne brinemo se za gornje linije samo ih prepisujemo: postsRepositry: typeOrm interface koji nam provajda da nam omoguci da radimo db querije
! paziti da se import pravi entitet Posts iz ./entities/post/entity

### \***\*OVAVEZNO DODATI NAKON OVOG U APP:MODULE:TS: entities: [\_\_dirname + '/../\*\***/\*\*.entity.{js,ts}']

sada idu metode:
!pitanje: od kud nam taj postsRepository? ocito iz konstruktora, moze valjda biit bilo sta glavno da je tip "Repository<Post>"
!istraziti malo DTO
kada dodem do ovog koraka, u post.service.ts treba returnane stringove pretvoriti u actual funkcionalnosti

### **jedina stvar je da treba CreatePostDto DTO (DATA TRANSER OBJECT) podesiti u create-post-dto.ts:**

        export class CreatePostDto {
        title: string;
        }

jedina dilema: meni je svugdje, npr u create (POST) napravilo: return this.postsService.create(createPostDto);, a on ima return this.postsRepository.create(createPostDto);
-rijeseno. ne mijesati posts.service.ts i posts.controller.ts: controller nam je gotov i ne diramo ga, a on poziva metode iz posts.service koji razradimo da vraca nesto korisno umjesto stringova
zatim nakon toga definiramo jos .save() da se spremi u bazu, da nije generirana samo instanca posts entity klase pa cijeli kod izgleda ovako:

za findOne,update itd nam u controlleru vec sve povlaci samo u service, tako da jbnica, samo definiramo u serviceu sto zelimo s tim pa tako za naci jedan zapis:
!ocito nest sam radi i async-await? ocito ne, ali onda kada ih koristiti a kada ne? ocito zza update query da

za gresku: Type 'number' has no properties in common with type 'FindOneOptions<User>'.
napraviti: https://stackoverflow.com/questions/71548592/nest-js-typeorm-cannot-use-findone-properly
ulavnom to je cesto deprecated paziti na verziju... https://progressivecoder.com/how-to-configure-nestjs-typeorm-integration-mysql/ je jedan nacin od definiranja crud tipova tj parametara

patch odnosno update samo pobire svojstva od createPost dto pa update-post.dto.ts pustamo kakav je

## IMAMO Model i Controller, možemo dodati i view:

slijediti ovo: https://docs.nestjs.com/techniques/mvc

    ako ne zelimo u main app:
    @Get()
    @Render('index')
    async findAll() {
    const message = await this.postsService.findAll();
    return { message };
    }

index.hbs:

    <ul>
            {{#each message}}
            <li>
                <h1>
                {{this.title}}
                </h1>
            </li>
            {{/each}}
        </ul>

## Redoslijed kodiranja 1

https://progressivecoder.com/how-to-configure-nestjs-typeorm-integration-mysql/

1 – NestJS TypeORM Package Installation - npm install --save @nestjs/typeorm typeorm mysql2

2 – NestJS TypeORM Configuration - in app.module.ts

3 – Entity and Repository - Basically, NestJS supports the popular Repository design pattern. In other words, each entity has its own repository.

    @Entity basically tells NestJS to register this class as an entity and enable a repository to access the same

4 – Creating the Module

5 – Creating the Controller

## Redoslijed kodiranja 2

Redoslijed:

-nest cli

-typeorm, mysql2 itd.

-kreiranje resursa user ili nekog drugog

-spajanje s bazom

-crud operacije

---

na ovim stranicam jako dobro i detaljno i jednostavno objasnjeni moduli controlleri i servisi:https://progressivecoder.com/nestjs-module-system-learn-nestjs-series-part-4/

---

+++

## MIGRACIJE

https://www.youtube.com/watch?v=5G81_VIjaO8
-kad ih radimo makar se radi u ts fileu, nastavci moraju biti js jer se ts kompajlira u js i typorm obrađuje taj js

- nest cli vec ima opciju za migracije koji ce to automatizirati, ali taj cli trba objekt koji se nalazi u @module(imports:[]) gdje definiramo konekciju na bazu i entitete za migraciju pa treba to izvuci van iz modula na app.module.ts
  napravimo izvan srca (u rootu) folder df s fileom npr. data-source.ts:
  nije tako brzo! \***\* dolje je vazno dodati ovu liniju u confi: migrations: ['dist/db/migrations/**.js'],

import { DataSource, DataSourceOptions } from 'typeorm';
import \*\* as dotenv from 'dotenv';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
type: 'mysql',
host: process.env.HOST,
port: Number(process.env.PORT),
username: 'root',
password: process.env.PASSWORD,
database: process.env.DATABASE,
entities: ['dist/****/**.entity.js'],
migrations: ['dist/db/migrations/**.js'],
// synchronize: true, // u produkciji umjesto ovog koristiti migracije
// dropSchema: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

app module je sada ovakav:
@Module({
imports: [TypeOrmModule.forRoot(dataSourceOptions), PostsModule],
controllers: [AppController],
providers: [AppService],
})

kreiramo npm skriptu za runnanje migracije u package.json pod scripts:
"typeorm": "npm run build && npx typeorm -d dist/db/data-source.js",
"migration:generate": "npm run typeorm -- migration:generate",
"migration:run": "npm run typeorm -- migration:run",
"migration:revert": "npm run typeorm --migration:revert"

runnamo ovako: npm run migration:generate -- db/migrations/NewMigration (ovo zadnje je ime: newMigration)

++++

## DB schema i veze:

bitno je gdje se nalazi dekorator @JoinColumn() - mora biti u ovisnoj tablici (klasi) npr. ako imamo kontakt i employee onda ide u kontakt - kontak mora imati info o kojem se zaposleniku radi, vise nego sta zaposlenik mora imati kontakt info?

- odnnosno tamo di je joincolumn tamo ce biti strani kljuc
  dva najbolja videa:
  pocetak: https://github.com/stuyy/nestjs-typeorm-mysql-course-repository (ima i github link u descr)
  od servicea do baze + veze: https://www.youtube.com/watch?v=rKgZLVgdvAY

-koliko vidim ako imamo npr user i profile oboje mozemo kreirati prvo, ali da je strani kljuc profileId u tablici user nullable:false onda bi trebalo prvo profil ili sve skupa

+++++
pruciti jos:
**constructor(@InjectRepository(Post) private postsRepository: Repository<Post>,
) {}**

# Dodatno za svidjeti

- najveci izazov: kako kreirati nove recordse u typorm-u s toliko stranih kljuceva
- Exception an error andlin: if (!user) {trow new NotFoundException()}; nest ima te uradene naive i mozemo amo rokati to i sam stvori error object -https://docs.nestjs.com/
- migracije,
- dotenv: HOST; port uisename i ostali config ucitavati iz .env varijable! - oracle ima configmodule i configservice
- response handling in controller
- cascade deleting from marius espejo: https://www.youtube.com/watch?v=rKgZLVgdvAY (brisi kontak tablicu ako se brise user)

# Pitanja

- dvije prve stvari: docker i da li treba samo api ili treba rez i prikazati na frontu (uz pomoc viesa SSR-a ili kako)

- Pitanje: da li u MVC dijelu, view je zapravo server side rendering?
- pitanje: kako typerom endl zero to many?

# Korisno

- msyslq server ce vjerojatno biti preko dockera: https://progressivecoder.com/how-to-configure-nestjs-typeorm-integration-mysql/
- docker run --name demo-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:latest
- find() u typorm dokumentaciji ima dobrre filtere kao limit, relations,
- bolje ne stavljati entities u app.module.ts pa jedan po jedan nego: entities: `['dist/\*\***/\*\*.entity.js']`,
- dto vs @entity: entity je klasa predstavlja tablicu u bazi koja (klasa koja je zapravo instanca objekta koji će se spremiti u bazu, tamo definiramo kako želimo da se podaci spremaju u bazu), a dto je zapravo entitet je klasa koje je reprezntacija tablea u bazi, opisuje database table, definira kako će izgledati, dok dto je reprezentacija podataka koji dolaze od klijenta, koliko sam skužio format koji se šalje s fronta mora biti takav kakav je definirain u dto, inače greška?
- DTO: data transfer object: kao scema, definir sto korisnik salje, polja koja ocekujem da klijent provajda, posrednik kod slanja, ako u njea stavimo name?: string onda moze biti empty inace ne
- ne raditi preko migracija, ali istraziti ih: https://www.youtube.com/watch?v=ghIwBQU9-Vo
  view? ne raditi na root korisniku, interceptori i middleware, parseIntPipeovi itd, validation pipovi: https://www.youtube.com/watch?v=2n3xS89TJMI, ispis na view u obliku table liste a ne obican
  -u slucaju da je docker, prvo instaliati sve pakete: nest.js projekt, pa npm install --save @nestjs/typeorm typeorm mysql2, onda pokrecemo docker container i tek onda pocinjemo kodirati, prva zadaca kod kodiranja je povezti typeorm i mysql

- ako ce trebati na osta dodatno: https://hevodata.com/learn/docker-mysql/#t6

# Typeorm

- TYPEORM - brine se umjesto nas da nemoramo gubiti vrijeme za pisanje SQLa odnosno SQL upita izmeduostalog za CRUD operacije pdoataka i tablica
- isto tako omogucava da deklariramo npr nesto kao string i onda pomocu dekoratora ga defirinramo u bazi kao neki drugi tip
