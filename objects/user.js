let bcrypt = require('bcrypt');
let NodeGeocoder = require('node-geocoder');
let rp = require('request-promise');
let likes = require('./likes.js');
let update = require('./update.js');

class User {
    constructor(props) {
        this.likes = new likes();
    }

    async dologin(res, db, sess, io, socket, allUsers) {
        const [results, fields] = await db.execute(
            "SELECT users.* , visit.visits FROM `users` LEFT JOIN visit ON visit.userid = users.id WHERE login=?",
            [res.login]);

        if (results[0]) {
            bcrypt.compare(res.password, results[0].password, (err, succ) => {
                if (succ) {
                    if (!results[0].visits){
                        const sql = "INSERT INTO visit VALUES (?, '{}')";

                        db.execute(sql, [results[0].id]);
                    }
                    User.update_date(db, res.login);
                    delete results[0].password;
                    sess.data = results[0];
                    sess.save((err) => {
                        if (err)
                            console.log(err);
                        update.refreshUser(db, sess, socket)
                            .then(() => this.updateUsers(sess, allUsers))
                            .then(() => io.emit('allUsers', allUsers));
                        socket.emit('doloc');
                    });
                }
                else
                    socket.emit('logpass');
            });
        }
        else
            io.sockets.emit('loglog');
    }

    static update_date(db, login) {
        let date = new Date();
        date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        // TODO UPDATE DATE ON ACTIVITY / LOGOUT
        let sql = "UPDATE users SET date = ? WHERE login = ?";
        db.execute(sql, [date, login]);
    }

    update_coords(res, db, sess) {
        let options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyAc2MJltSS6tF0okq-aKxKdtmGIhURn0HI', // for Mapquest, OpenCage, Google Premier
            formatter: null
        };
        let geocoder = NodeGeocoder(options);
        geocoder.reverse({'lat': res.lat, 'lon': res.lon})
            .then(res => {
                User.update_coords_db(res[0], db, sess);
            })
            .catch(err => {
                rp('https://ipapi.co/' + sess.ip + '/json')
                    .then(res => {
                        res = JSON.parse(res);
                        if (res.reserved)
                            return rp('https://ipapi.co/json');
                        else
                            User.update_coords_db(res, db, sess);
                    })
                    .then(res => {
                        if (res) {
                            res = JSON.parse(res);
                            User.update_coords_db(res, db, sess);
                        }
                    })
                    .catch(err => console.log(err));
            });
    }

    static async update_coords_db(res, db, sess) {
        let entry = [];
        if (res.ip) {
            entry.push(res.country_name);
            entry.push(res.postal);
            entry.push('1');
        } else {
            entry.push(res.country);
            entry.push(res.zipcode);
            entry.push('0');
        }

        try {
            let req = "SELECT logid FROM location WHERE logid=?";
            let [results, fields] = await db.execute(req, [sess.data.id]);

            if (results[0]) {
                req = "DELETE FROM location WHERE logid=?";
                [results, fields] = await db.execute(req, [sess.data.id]);
            }
            req = "INSERT INTO location(logid, lat, lon, city, country, zipcode, ip) VALUES (?, ?, ?, ?, ?, ?, ?)";
            [results, fields] = await db.execute(req, [sess.data.id, res.latitude, res.longitude, res.city, ...entry]);
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

