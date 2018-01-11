let mysql = require('mysql2');

let database = function (db){
  this.host = "localhost";
  this.port = "3306";
  this.user = "root";
  this.password = "";
  this.multipleStatements = true;
  this.database = db;
};


let Condb = function(db){
    this.dbInfo = new database(db);
    this.con = mysql.createConnection(this.dbInfo);
};

module.exports = Condb;