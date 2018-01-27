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

    async dologin(res, db, sess, socket) {
        const [results, fields] = await db.con.execute(
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
        let options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyAc2MJltSS6tF0okq-aKxKdtmGIhURn0HI', // for Mapquest, OpenCage, Google Premier
            formatter: null
        };
        // console.log(res);
        let geocoder = NodeGeocoder(options);
            geocoder.reverse({'lat': res.coords.latitude, 'lon': res.coords.longitude}, (err, res) => {
                if (res)
                    console.log(res);
                else if (err)
                    ipapi.location(res => console.log(res), sess.ip);
                else
                    ipapi.location(res => console.log(res));
            });
    };
}

module.exports = User;

