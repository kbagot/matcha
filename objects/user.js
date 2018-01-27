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
                    User.update_coords(res, db, sess, socket);
                }
                else
                    socket.emit('logpass');
            });
        }
        else
            socket.emit('loglog');
    }

    static update_coords(res, db, sess, socket) {
        let options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyAc2MJltSS6tF0okq-aKxKdtmGIhURn0HI', // for Mapquest, OpenCage, Google Premier
            formatter: null
        };
        let geocoder = NodeGeocoder(options);
        console.log(res.coords);
        if ("lat" in res.coords) {  ///GEO  have been granted
            geocoder.reverse({'lat': res.coords.lat, 'lon': res.coords.lon}, (err, res) => {
             console.log(res);
             // console.log(err);
            });
        }
        else {// IF WE DENIED THE GEOLOC
            if (sess.ip === '127.0.0.1' || sess.ip === '1')  ///
                ipapi.location((res) => console.log(res));
            else
                ipapi.location(res => console.log(res), sess.ip);
        }


    };
}

module.exports = User;

