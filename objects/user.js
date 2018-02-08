let bcrypt = require('bcrypt');
let NodeGeocoder = require('node-geocoder');
let rp = require('request-promise');
let likes = require('./likes.js');

class User {
    constructor(props) {
        this.data = {
            login: "motherfcker",
            password: '',
            email: '',
            valid: '',
            notif: '',
            sexe: '',
            bio: '',
            orientation: ''
        };
        this.likes = new likes();
    }

    async dologin(res, db, sess, io, socket, allUsers) {
        const [results, fields] = await db.execute(
            "SELECT * FROM `users` WHERE login=?",
            [res.login]);
        if (results[0]) {
            bcrypt.compare(res.password, results[0].password, (err, succ) => {
                if (succ) {
                    for (let i in this.data)
                        this.data[i] = results[0][i];
                    sess.data = results[0];
                    sess.save((err) => {
                        if (err)
                            console.log(err);
                        socket.emit('user', sess.data, () => {
                            this.updateUsers(sess, allUsers)
                                .then(() => {
                                    io.emit('allUsers', allUsers);
                                    User.getMatch(db, sess, socket);
                                })
                                .catch((e) => console.log(e));
                        });
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

    update_coords(res, db, sess) {
        let options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyAc2MJltSS6tF0okq-aKxKdtmGIhURn0HI', // for Mapquest, OpenCage, Google Premier
            formatter: null
        };
        let geocoder = NodeGeocoder(options);

        // let geodist = require('geodist');
        //
        // let dist = geodist({lat: res.lat, lon: res.lon}, {lat: 33.7489, lon: -84.3881}, {unit: 'km'});  // opt limit   $(USER INPUT DISTANCE)
        // console.log(dist);

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
            let req = "SELECT login FROM location WHERE login=?";
            let [results, fields] = await db.execute(req, [sess.data.login]);

            if (results[0]) {
                req = "DELETE FROM location WHERE login=?";
                [results, fields] = await db.execute(req, [sess.data.login]);
            }
            req = "INSERT INTO location(login, lat, lon, city, country, zipcode, ip) VALUES (?, ?, ?, ?, ?, ?, ?)";
            [results, fields] = await db.execute(req, [sess.data.login, res.latitude, res.longitude, res.city, ...entry]);
        } catch (e) {
            console.log(e);
        }

    };

    userDisconnect(io, sess, socket, allUsers) {
        let index = allUsers.indexOf(sess.data.login);
      
        allUsers.splice(index, 1);
        sess.destroy();
        socket.emit("userDisconnect", "");
        io.emit("allUsers", allUsers);
    }

    updateUsers(sess, allUsers) {
        return new Promise((resolve, reject) => {
            this.alreadyExists(sess.data.login, allUsers)
                .then(() => {
                    allUsers.push(sess.data.login);
                    resolve()
                })
                .catch(() => {
                    resolve();
                });
        });
    }

    alreadyExists(login, allUsers){
        return new Promise((resolve, reject) =>{
            if (allUsers) {
                for (let elem of allUsers) {
                    if (elem === login) {
                        reject("Login already exists");
                    }
                }
            }
            resolve();
        });
    }

    static getMatch(db, sess, socket){
        let sql = "SELECT  (CASE u1 WHEN ? THEN u2 ELSE u1 END) AS user FROM (SELECT user1 AS u1, user2 AS u2 FROM likes WHERE (user1=? OR user2=?) AND matcha=true) AS results";
        let login = sess.data.login;

        db.execute(sql, [login, login, login]).then(([rows]) => {
            rows.forEach((elem) => {
               if (!sess.data.match){
                   sess.data.match = [elem.user];
               } else if (sess.data.match.indexOf(elem.user) === -1) {
                   sess.data.match.push(elem.user);
               }
               sess.save();
            });
            socket.emit('match', {type: 'match', match: sess.data.match});
        });
    }

}

module.exports = User;

