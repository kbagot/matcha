let ConDb = require('./connect.js');
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
    "location TEXT DEFAULT NOT NULL" +
    ");";
let request = require('request-promise');
let bcrypt = require('bcrypt');

class Setup {
    async setDatabase() {
        this.db = await ConDb.createConnection();
        this.db.con.query(sql, (err, res, fields) => {
            if (err) throw err;
            request('https://randomuser.me/api/?results=500&exc=picture,id,cell,phone,registered,dob,login,location&nat=fr,be').then((res) => this.fillDb(JSON.parse(res).results));
        });

    }

    async fillDb(data) {
        for (const [i, elem] of data.entries()) {
            let req = "INSERT INTO users(login, last, first, password, email, sexe, bio, orientation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            let login = elem.name.last + elem.name.first + i;
            let password = await bcrypt.hash("test", 10);

            await this.db.con.execute(req, [login, elem.name.last, elem.name.first, password, elem.email, elem.gender === 'female' ? 'F' : 'M', '', Setup.randomOrientation()]);
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

module.exports = Setup;