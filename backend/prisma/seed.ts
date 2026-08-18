import { PrismaClient, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedProducts() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Skipping products — ${existing} already exist.`);
    return;
  }

  const res = await fetch('https://dummyjson.com/products?limit=20');
  const data = await res.json();

  for (const item of data.products) {
    await prisma.product.create({
      data: {
        title: item.title,
        price: item.price,
        category: item.category,
        description: item.description,
      },
    });
  }

  console.log(`Seeded ${data.products.length} products.`);
}

async function seedCustomers() {
  const existing = await prisma.customer.count();
  if (existing > 0) {
    console.log(`Skipping customers — ${existing} already exist.`);
    return;
  }

  for (let i = 0; i < 15; i++) {
    await prisma.customer.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
      },
    });
  }

  console.log('Seeded 15 customers.');
}

async function seedOrders() {
  const existing = await prisma.order.count();
  if (existing > 0) {
    console.log(`Skipping orders — ${existing} already exist.`);
    return;
  }

  const customers = await prisma.customer.findMany();
  const products = await prisma.product.findMany();

  for (let i = 0; i < 40; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const itemCount = faker.number.int({ min: 1, max: 4 });
    const chosenProducts = faker.helpers.arrayElements(products, itemCount);

    await prisma.order.create({
      data: {
        customerId: customer.id,
        status: faker.helpers.arrayElement(Object.values(OrderStatus)),
        items: {
          create: chosenProducts.map((product) => ({
            productId: product.id,
            quantity: faker.number.int({ min: 1, max: 5 }),
          })),
        },
      },
    });
  }

  console.log('Seeded 40 orders.');
}

async function main() {
  await seedProducts();
  await seedCustomers();
  await seedOrders();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });