
# ShareBook API

## Tech Stack

| Scope             | Library                                                               |
| ----------------- | --------------------------------------------------------------------- |
| Core framework    | [Nest Js](https://nestjs.com/) |
| Type   | Restful API |
| Database  | Mysql     |
| ORM   | [Prisma](https://mongoosejs.com/) |
| API Doc   | [Swagger](https://docs.nestjs.com/openapi/introduction) |

## Deployment

To deploy this project in development environment follow the instruction below

**Step 1.**

```bash
  git clone https://github.com/htetarkarhlaing/share-book-api
```

**Step 2.**

```bash
  cd share-book-api
```

**Step 3.**

```bash
  npm install
```

**Step 4.**

For Linux & Mac

```bash
  cp .env.example .env
```

For Windows

```bash
  copy .env.example .env
```

**Step 5.**

```bash
  npx prisma migrate reset
```

**Step 6.**

```bash
  npm run start:dev
```

or

```bash
  npm run build

  npm run start
```

After you start the server, try to open the API Doc that is already hosted at each of every server respectively.

Note -> Admin account cannot create by yourself.
So, Please use 

```bash
  login_id: 000000
  password: 000000
```
for server created admin account.

http://localhost:${your-server-port}

## License

[APACHE2.0](https://choosealicense.com/licenses/apache-2.0)

## Author

- [@htetarkarhlaing](https://www.github.com/htetarkarhlaing)