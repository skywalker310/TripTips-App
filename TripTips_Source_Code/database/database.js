var Sequelize = require('sequelize');
var db = {};

// Credientials for MySQL Database
var credentials = require('../config/key.json');
var HOST = credentials.host;
var USER = credentials.user;
var PASSWORD = credentials.password;
var DATABASE = credentials.database;

/* Setup Database Connection */
var sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
	host: HOST,
	dialect: 'mysql',
	operatorsAliases: false
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db 