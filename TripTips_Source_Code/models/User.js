const Sequelize = require('sequelize')
const db = require('../database/database.js')

module.exports = db.sequelize.define(
  'users',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false
    },
    date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  },
  {
    timestamps: false
  }
)