let bcrypt = require('bcrypt');
let NodeGeocoder = require('node-geocoder');
let ipapi = require('ipapi.co');

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
    }

    async dologin(res, db, sess, socket, chatUsers) {
        const [results, fields] = await db.con.execute(
            "SELECT * FROM `users` WHERE login=?",
            [res.login]);

        if (results[0]) {
            bcrypt.compare(res.password, results[0].password, (err, succ) => {
                if (succ) {
                    for (let i in this.data)
                        this.data[i] = results[0][i];
                    sess.data = results[0];
                    chatUsers.push(results[0].login);
                    sess.save((err) => {
                        if (err)
                            console.log(err);
                        socket.emit('user', sess.data);
                        socket.broadcast.emit('newChatUser', chatUsers);
                        socket.emit('doloc');
                    });
                    // User.update_coords(res, db, sess, socket);
                }
                else
                    socket.emit('logpass');
            });
        }
        else
            socket.emit('loglog');
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
}

module.exports = User;

