let Database = require ('./database.js') ;
let mysql = require('mysql2/promise');
let request = require('request-promise');
let bcrypt = require('bcrypt');

class ConDb {
    constructor(props){
        if (props === undefined){
            throw new Error('call createConnection instead');
        }
        else{
            this.con = props;
        }
    }

     static async createConnection(){
        return new Promise ((resolve, reject) => {
             let dbInfo = new Database();

             mysql.createConnection(dbInfo)
                 .then((res) => ConDb.checkDb(res))
                 .then((res) => resolve(res))
                 .catch((err) => reject(err));
        });
    }

    static async checkDb(db){
         return new Promise((resolve, reject) => {
            db.query("USE matcha")
                .then((res) => resolve(db))
                .catch(() => {
                console.log("reset");
                    let sql = "DROP DATABASE IF EXISTS matcha;" +
                        "CREATE DATABASE matcha;" +
                        "use matcha;" +
                        "CREATE TABLE users(" +
                        "id int not null auto_increment primary key," +
                        "login varchar(255) not null," +
                        "last varchar(255) not null," +
                        "first varchar(255) not null," +
                        "password varchar(255) not null," +
                        "email varchar(255) not null," +
                        "valid boolean default 0," +
                        "hash varchar(255)," +
                        "notif boolean default 1," +
                        "sexe enum('M', 'F') not null," +
                        "bio varchar(255)," +
                        "orientation ENUM('gay','hetero','bi') default 'bi'" +
                        ");" +
                        "CREATE TABLE location(" +
                        "ID int not NULL auto_increment primary key," +
                        "login varchar(255) NOT NULL," +
                        "lat decimal(15, 10) NOT NULL," +
                        "lon decimal(15, 10) NOT NULL," +
                        "city varchar(255) not null," +
                        "country varchar(255) NOT NULL," +
                        "zipcode int NOT NULL," +
                        "ip boolean default 1);" +
                        "CREATE TABLE likes (" +
                        "id int not null auto_increment primary key," +
                        "user1 varchar(255) not null," +
                        "user2 varchar(255) not null," +
                        "matcha boolean default false);" +
                        "CREATE TABLE notif(" +
                        "id int auto_increment  primary key," +
                        "login varchar(255) not null," +
                        "type ENUM('like', 'unlike', 'visit', 'message', 'match', 'unmatch') not null," +
                        "`from` varchar(255) not null);" +
                        "CREATE TABLE chat(" +
                        "id int auto_increment primary key," +
                        "user1 varchar(255) not null," +
                        "user2 varchar(255) not null," +
                        "history text," +
                        "messages text" +
                        "`from` varchar(255)"+
                        ");";
              
                    db.query(sql).then(() => resolve(db))
                        .catch((err) => reject(err));
                });
        });

    }

    async seedUsers(){
        ConDb.createConnection()
            .then(() => request('https://randomuser.me/api/?results=500&exc=picture,id,cell,phone,registered,dob,login,location&nat=fr,be'))
            .then((res) => this.fillDb(JSON.parse(res).results))
            .catch((err) => console.log(err));
    }

    async fillDb(data) {
        for (const [i, elem] of data.entries()) {
            let req = "INSERT INTO users(login, last, first, password, email, sexe, bio, orientation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            let login = elem.name.last + elem.name.first + i;
            let password = await bcrypt.hash("test", 10);

            await this.con.execute(req, [login, elem.name.last, elem.name.first, password, elem.email, elem.gender === 'female' ? 'F' : 'M', '', ConDb.randomOrientation()]);
            console.log("db success => " + i);
        }
    }

    static randomOrientation() {
        let nb = Math.floor(Math.random() * 3);
        switch (nb) {
            case 0:
                return 'gay';
            case 1:
                return 'hetero';
            case 2:
                return 'bi';
        }
    }
}

module.exports = ConDb;