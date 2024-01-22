import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

const adminAccountCreator = async () => {
  console.log('Start');

  const createdAdmin = await prisma.admin.create({
    data: {
      login_id: '000000',
      name: 'default',
      password: await hash('000000'),
    },
  });
  console.log(createdAdmin.login_id);

  console.log('Finished');
};

adminAccountCreator();
