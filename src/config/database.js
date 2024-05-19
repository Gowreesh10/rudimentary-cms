const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('CMS', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql' 
});

module.exports = sequelize;
