let bcrypt = require('bcrypt');
let NodeGeocoder = require('node-geocoder');
let ipapi = require('ipapi.co');
let likes = require('./likes.js');

class User {
    constructor() {
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

    async dologin(res, db, sess, io, socket, chatUsers) {
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
                        socket.emit('user', sess.data);
                        this.updateUsers(sess.data.login, chatUsers)
                            .then(() => io.emit('chatUsers', chatUsers))
                            .catch(() => null);
                        // socket.emit('doloc');
                    });
                    // User.update_coords(res, db, sess, socket);
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

    userDisconnect(io, sess, socket, chatUsers){
        let index = chatUsers.indexOf(sess.data.login);
        chatUsers.splice(index, 1);
        sess.destroy();
        socket.emit("userDisconnect", "");
        io.emit("chatUsers", chatUsers);
    }

    updateUsers(login, chatUsers){
        return new Promise((resolve, reject) => {
            this.alreadyConnected(login, chatUsers).then((res) => resolve())
                .catch(() => {
                        chatUsers.push(login);
                        resolve();
                });
        });
    }

    alreadyConnected(login, chatUsers){
        return new Promise((resolve, reject) =>{
            for (let elem of chatUsers){
                if (elem === login){
                    resolve(login);
                }
            }
            reject();
        });
    }

}

module.exports = User;

