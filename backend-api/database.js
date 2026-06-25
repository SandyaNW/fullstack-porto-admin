import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './portfolio.db',
  logging: false,
});

export default sequelize;
