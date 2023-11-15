var DataTypes = require("sequelize").DataTypes;
var _Posts = require("./Posts");
var _Products = require("./Products");
var _SequelizeMeta = require("./SequelizeMeta");
var _Users = require("./Users");

function initModels(sequelize) {
  var Posts = _Posts(sequelize, DataTypes);
  var Products = _Products(sequelize, DataTypes);
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var Users = _Users(sequelize, DataTypes);

  Products.belongsTo(Users, { as: "author_User", foreignKey: "author"});
  Users.hasMany(Products, { as: "Products", foreignKey: "author"});

  return {
    Posts,
    Products,
    SequelizeMeta,
    Users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
