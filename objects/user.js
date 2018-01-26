let bcrypt = require('bcrypt');
let NodeGeocoder = require('node-geocoder');
let ipapi = require('ipapi.co');

class User {
    constructor() {
        this.socket = null;
        this.sess = null;
        this.data = {login: "motherfcker",
        password: '',
        email: '',
        valid: '',
        notif: '',
        sexe: '',
        bio: '',
        orientation: ''};
    }

    async dologin(res, db) {
        const [results, fields] = await db.con.execute(
            "SELECT * FROM `users` WHERE login=?",
            [res.login]);
        if (results[0]) {
            bcrypt.compare(res.password, results[0].password, (err, succ) => {
                if (succ) {
                    for (let i in this.data)
                        this.data[i] = results[0][i];
                    if (this.sess){
                        this.sess.data = results[0];
                        this.sess.save((err) => console.log(err));
                    }
                }
                else
                    this.socket.emit('logpass');
            });
        }
        else
            this.socket.emit('loglog');
    }

   update_coords(res, db){
       let options = {
           provider: 'google',
           httpAdapter: 'https', // Default
           apiKey: 'AIzaSyAc2MJltSS6tF0okq-aKxKdtmGIhURn0HI', // for Mapquest, OpenCage, Google Premier
           formatter: null
       };

       // console.log(req.ip.split(":").pop());   IP CLIENT

       ipapi.location((res) => {
         console.log(res);
       });

       let geocoder = NodeGeocoder(options);

       geocoder.reverse({'lat': res.coords.lat, 'lon': res.coords.lon}, (err, res) => {
           console.log(res);
           console.log(err);
       });
    };

    updateSocket(socket){
        this.socket = socket;
    }
    updateSession(session){
            this.sess = session;
        }
}

module.exports = User;

