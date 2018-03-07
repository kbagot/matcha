let Database = require('./database.js');
let mysql = require('mysql2/promise');
let request = require('request-promise');
let bcrypt = require('bcrypt');

class ConDb {
    constructor(props) {
        if (props === undefined) {
            throw new Error('call createConnection instead');
        }
        else {
            this.con = props;
        }
    }

    static async createConnection() {
        return new Promise((resolve, reject) => {
            let dbInfo = new Database();

            mysql.createConnection(dbInfo)
                .then((res) => ConDb.checkDb(res))
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    static async checkDb(db) {
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
                        "age TINYINT," +
                        "sexe enum('M', 'F', 'T') not null," +
                        "bio varchar(255)," +
                        "orientation ENUM('m', 'f', 'bi', 'trans') default 'bi'," +
                        "tags JSON," +
                        "spop INT default 0," +
                        "date DATETIME" +
                        ");" +
                        "CREATE TABLE location(" +
                        "lolilol int not NULL auto_increment primary key," +
                        "logid INT NOT NULL," +
                        "lat decimal(15, 10) NOT NULL," +
                        "lon decimal(15, 10) NOT NULL," +
                        "city varchar(255) not null," +
                        "country varchar(255) NOT NULL," +
                        "zipcode varchar(255) NOT NULL," +
                        "ip boolean default 1" +
                        ");" +
                        "CREATE TABLE likes (" +
                        "id int not null auto_increment primary key," +
                        "user1 varchar(255) not null," +
                        "user2 varchar(255) not null," +
                        "matcha boolean default false" +
                        ");" +
                        "CREATE TABLE tags(" +
                        "tag_name varchar(255) primary key" +
                        ");" +
                        "INSERT INTO tags " +
                        "(tag_name)" +
                        "VALUES ('fake')" + // TODO ADD TES IDEE DE TAGS
                        ";" +
                        "CREATE TABLE notif(" +
                        "id int auto_increment  primary key," +
                        "login varchar(255) not null," +
                        "type ENUM('like', 'unlike', 'visit', 'message', 'match', 'unmatch') not null," +
                        "`from` varchar(255) not null," +
                        "`read` boolean default false);" +
                        "CREATE TABLE chat(" +
                        "id int auto_increment primary key," +
                        "user1 varchar(255) not null," +
                        "user2 varchar(255) not null," +
                        "history text," +
                        "messages text," +
                        "`from` varchar(255)" +
                        ");" +
                        "CREATE TABLE img (" +
                        "`index` int auto_increment primary key," +
                        "userid int not null," +
                        "imgid varchar(255) not null," +
                        "`profil` boolean default false);";

                    db.query(sql).then(() => resolve(db))
                        .catch((err) => reject(err));
                });
        });

    }

    async seedUsers() {
        ConDb.createConnection()
            .then(() => request('https://randomuser.me/api/?results=500&exc=picture,id,cell,phone,registered,dob,login&nat=fr,be'))
            .then((res) => this.fillDb(JSON.parse(res).results))
            .catch((err) => console.log(err));
    }

    async fillDb(data) {
        let fakeloc = [];
        fakeloc.push(['48.8566', '2.3522', 'Paris', 'France', '75000']);
        fakeloc.push(['50.8503', '4.3517', 'Brussels', 'Belgium', '1000']);
        fakeloc.push(['45.7640', '4.8357', 'Lyon', 'France', '69000']);
        fakeloc.push(['51.5074', '0.1278', 'London', 'England', 'WC2N']);
        let tags = ['fake'];

        try {
            let date = new Date();
            date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            let password = await bcrypt.hash("test", 10);
            for (const [i, elem] of data.entries()) {
                let req = "INSERT INTO users(login, last, first, password, email, sexe, bio, age, orientation, tags, spop, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                let login = elem.name.last + elem.name.first + i;

                let ret = await this.con.execute(req, [login, elem.name.last, elem.name.first, password, elem.email,
                    elem.gender === 'female' ? 'F' : 'M', 'Fake User', Math.floor(Math.random() * 80) + 18, /TODO GEn transsexuelle
                    ConDb.randomOrientation(), JSON.stringify(tags), Math.floor(Math.random() * 1000), date]);
                console.log("db success => " + i);

                req = "INSERT INTO location(logid, lat, lon, city, country, zipcode, ip) VALUES (?, ?, ?, ?, ?, ?, ?)";
                await this.con.execute(req, [ret[0].insertId, ...fakeloc[Math.floor(Math.random() * fakeloc.length)], '1']);
            }
        } catch (e) {
            console.log(e);
        }
    }

    static randomOrientation() {
        let nb = Math.floor(Math.random() * 4);
        switch (nb) {
            case 0:
                return 'gay';
            case 1:
                return 'hetero';
            case 2:
                return 'bi';
            case 3:
                return 'trans';
        }
    }
}

module.exports = ConDb;