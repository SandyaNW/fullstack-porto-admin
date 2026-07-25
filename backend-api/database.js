import { Sequelize } from 'sequelize';
import pg from 'pg'; // Force Vercel to bundle the pg driver for Sequelize
import 'pg-hstore'; // Force Vercel to bundle the pg-hstore package

// Support both SQLite locally and PostgreSQL on Supabase/production
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required for Supabase connections
        },
      },
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './portfolio.db',
      logging: false,
    });

export default sequelize;
