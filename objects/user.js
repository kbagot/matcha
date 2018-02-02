let bcrypt = require('bcrypt');
let NodeGeocoder = require('node-geocoder');
let ipapi = require('ipapi.co');
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
                                })
                                .catch(() => console.log("ERROR"));
                        });
                        // socket.emit('doloc');
                    });
                }
                else
                    socket.emit('logpass');
            });
        }
        else
            io.sockets.emit('loglog');
    }

    update_coords(res, db, sess, socket) {
        console.log((new Date).getMinutes());
        let options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyAc2MJltSS6tF0okq-aKxKdtmGIhURn0HI', // for Mapquest, OpenCage, Google Premier
            formatter: null
        };
        let locdata = null;
        // console.log(res);
        let geocoder = NodeGeocoder(options);
        geocoder.reverse({'lat': res.lat, 'lon': res.lon}, (err, res) => {
            if (res) {
                locdata = res;
                // console.log(res);
                // console.log(err);
            }
            else if (err) {
                ipapi.location(res => {
                        locdata = res;
                        if (res.reserved)
                            ipapi.location(res => locdata = res);
                    },
                    sess.ip);
                console.log(locdata);
            }
            console.log(locdata);
        });
    };

    userDisconnect(io, sess, socket, allUsers){
        let index = allUsers.indexOf(sess.data.login);

        allUsers.splice(index, 1);
        sess.destroy();
        socket.emit("userDisconnect", "");
        io.emit("allUsers", allUsers);
    }

    updateUsers(sess, allUsers){
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

}

module.exports = User;

