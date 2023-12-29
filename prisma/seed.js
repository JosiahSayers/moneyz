import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

seed();

async function seed() {
  const josiah = await db.user.create({
    data: {
      name: 'Josiah Sayers',
      email: 'josiah.sayers15@gmail.com',
      username: 'josiahsayers'
    },
  });

  const lauren = await db.user.create({
    data: {
      name: 'Lauren Sayers',
      email: 'laurensyr113@gmail.com',
      username: 'laurensayers'
    }
  })
  
  const joy = await db.benefactor.create({
    data: {
      name: 'Joy'
    }
  });
  
  const earnings = await db.earning.createMany({
    data: [
      {
        description: 'Tried broccoli',
        amountInCents: 100,
        addedById: josiah.id,
        benefactorId: joy.id
      },
      {
        description: 'Cleaned bathroom',
        amountInCents: 300,
        addedById: lauren.id,
        benefactorId: joy.id
      }
    ]
  });

  const payouts = await db.payout.create({
    data: {
      type: 'robux',
      amountInCents: 300,
      paidById: josiah.id,
      benefactorId: joy.id,
    }
  });
}

export {};
