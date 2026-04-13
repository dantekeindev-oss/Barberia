require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

prisma.$connect()
  .then(() => {
    console.log('Database connected successfully!');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Database connection error:', e.message);
    process.exit(1);
  });
