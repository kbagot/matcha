let Database = require ('./database.js') ;
// let mysql = require('mysql2');
let mysql = require('mysql2/promise');

class ConDb {
    constructor(props){
        this.dbInfo = new Database(props);
        this.con = mysql.createConnection(this.dbInfo);
    }
}

module.exports = ConDb;