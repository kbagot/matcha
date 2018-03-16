let bcrypt = require('bcrypt');
let NodeGeocoder = require('node-geocoder');
let rp = require('request-promise');
let likes = require('./likes.js');
let update = require('./update.js');

class User {
    constructor(props) {
    }

    async dologin(res, db, sess, io, socket, allUsers) {
        const [results, fields] = await db.execute(
            "SELECT users.* , UNIX_TIMESTAMP(users.date) AS date, visit.visits, block.list AS block FROM `users` LEFT JOIN visit ON visit.userid = users.id LEFT JOIN block ON block.userid = users.id WHERE login=?",
            [res.login]);

        if (results[0]) {
            bcrypt.compare(res.password, results[0].password, async (err, succ) => {
                if (succ) {
                    User.update_date(db, res.login);
                    delete results[0].password;
                    sess.data = results[0];
                    await User.addPopLogin(db, sess);
                    sess.spop += 10;
                    sess.save(async (err) => {
                        if (err)
                            console.log(err);
                        await User.update_coords({lon: res.lon, lat: res.last}, db, sess);
                        update.refreshUser(db, sess, socket)
                            .then(() => this.updateUsers(sess, allUsers))
                            .then(() => io.emit('allUsers', allUsers));
                    });
                }
                else
                    socket.emit('logPass');
            });
        }
        else {
            socket.emit('logLog');
        }
    }

    static async addPopLogin(db, sess) {
        const sql = "UPDATE users SET spop = spop+10 WHERE id = ?";

        await db.execute(sql, [sess.data.id]);
    }

    static update_date(db, login) {
        let date = new Date();
        date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        // TODO UPDATE DATE ON ACTIVITY / LOGOUT
        let sql = "UPDATE users SET date = ? WHERE login = ?";
        db.execute(sql, [date, login]);
    }

    static async update_coords(res, db, sess, respond) {
        let options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyAc2MJltSS6tF0okq-aKxKdtmGIhURn0HI', // for Mapquest, OpenCage, Google Premier
            formatter: null
        };
        let geocoder = NodeGeocoder(options);

        let api = 'reverse';
        let query = {'lat': res.lat, 'lon': res.lon};
        if ('city' in res && res.city) {
            api = 'geocode';
            query = res.city;
        }

        try {
            const res = await geocoder[api](query);

            if (res[0]) {
                await User.update_coords_db(res[0], db, sess, respond);
            }
        } catch (e) {
            try {
                let apiRes = await rp('https://ipapi.co/' + sess.ip + '/json');

                let res = JSON.parse(apiRes);
                if (res.reserved || sess.ip === undefined) {
                    res = await rp('https://ipapi.co/json');
                    if (res) {
                        res = JSON.parse(res);
                        await User.update_coords_db(res, db, sess, respond);
                    }
                }
                else
                    await User.update_coords_db(res, db, sess, respond);
            } catch (e) {
                console.log(e);
            }
        }
    }

    static async update_coords_db(res, db, sess, respond) {

        let entry = [];
        if (res.ip) {
            entry.push(res.country_name);
            entry.push(res.postal);
            entry.push('1');
        } else {
            if (!res.country)
                entry.push('Unknown');
            else
                entry.push(res.country);
            if (!res.zipcode && res.countryCode)
                entry.push(res.countryCode);
            else if (res.zipcode)
                entry.push(res.zipcode);
            else
                entry.push('Unknown');
            entry.push('0');
        }

        try {
            let req = "SELECT logid FROM location WHERE logid=?";
            let [results, fields] = await db.execute(req, [sess.data.id]);

            if (results[0]) {
                req = "DELETE FROM location WHERE logid=?";

                [results, fields] = await db.execute(req, [sess.data.id]);
            }
            req = "INSERT INTO locatio" +
                "n(logid, lat, lon, city, country, zipcode, ip) VALUES (?, ?, ?, ?, ?, ?, ?)";
            [results, fields] = await db.execute(req, [sess.data.id, res.latitude, res.longitude, res.city, ...entry]);
            // respond();
        } catch (e) {
            console.log(e);
        }

    };

    userDisconnect(io, sess, socket, allUsers) {
        let index = allUsers.findIndex(elem => elem.login === sess.data.login);

        allUsers.splice(index, 1);
        sess.destroy();
        socket.emit("userDisconnect", "");
        io.emit("allUsers", allUsers);
    }

    updateUsers(sess, allUsers) {
        return new Promise((resolve, reject) => {
            this.alreadyExists(sess.data.login, allUsers)
                .then(() => {
                    allUsers.push({login: sess.data.login, id: sess.data.id});
                    resolve()
                })
                .catch(() => {
                    resolve();
                });
        });
    }

    alreadyExists(login, allUsers) {
        return new Promise((resolve, reject) => {
            if (allUsers) {
                for (let elem of allUsers) {
                    if (elem.login === login) {
                        reject("Login already exists");
                    }
                }
            }
            resolve();
        });
    }
}

module.exports = User;

