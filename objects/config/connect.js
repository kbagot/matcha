let Database = require ('./database.js') ;
let mysql = require('mysql2');

class ConDb {
    constructor(props){
        this.dbInfo = new Database(props);
        this.con = mysql.createConnection(this.dbInfo);
    }
}

module.exports = ConDb;