import { Sequelize } from 'sequelize';

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
