let     ConDb =  require('./connect.js');
let     sql = "DROP DATABASE IF EXISTS matcha;" +
             "CREATE DATABASE matcha;"+
             "use matcha;"+
             "CREATE TABLE users(" +
             "id int not null auto_increment primary key," +
             "login varchar(255) not null," +
             "password varchar(255) not null," +
             "email varchar(255) not null," +
             "valid boolean default 0," +
             "hash varchar(255)," +
             "notif boolean default 1," +
             "sexe enum('M', 'F') not null," +
             "bio varchar(255)," +
             "orientation ENUM('hetero','bi','gay') default 'bi'" +
             ");";

class Setup {
    constructor(props){
        this.db = new ConDb();
    }

    setDatabase() {
        this.db.con.query(sql, function (err, res, fields) {
            if (err) throw err;
            console.log("db success");
        });
    }
}

module.exports = Setup;