let Database = require ('./database.js') ;
// let mysql = require('mysql2');
let mysql = require('mysql2/promise');

class ConDb {
    constructor(props){
        if (props === undefined){
            throw new Error('call createConnection instead');
        }
        else{
            this.con = props;
        }

    }

     static async createConnection(db){
        let con = null;
        let dbInfo = new Database(db);
        try {
            con = await mysql.createConnection(dbInfo);
        }catch(e){
            console.log(e);
        }
        return new ConDb(con);
    }
}

module.exports = ConDb;