let database = require('./config/connect.js'),
    crypto = require('crypto'),
    register = require('./register'),
    user = require('./user.js');

class Controller {
    constructor(props) {
        let io = require('socket.io').listen(props);
        io.on('connection', async (socket) => {
            this.user = new user({socket: socket});
            database.createConnection('matcha').then((res) => {
                this.register = new register({socket: socket, db: res});
                this.db = res;
                this.socketEvents(socket);
            }).catch((e) => console.log(e));
        });
    }

   socketEvents(socket) {
       socket.on('login', (res) => {
               this.user.dologin(res, this.db);
               console.log(this.user.data);
            }
        );

        socket.on('changeRegister', (data) => this.register.registerErrorHandling(data));
    }


    // async adduser(res) {
    //     return new Promise(async function (resolve) {
    //         const [results, fields] = await db.con.execute("SELECT email FROM `users` WHERE `email`=?", [res.email]);
    //         if (!results[0]) {
    //             let [results, fields] = db.con.execute(
    //                 "SELECT login FROM `users` WHERE `login`=?", [res.login]);
    //             if (!results[0]) {
    //                 let [results, fields] = db.con.execute(
    //                     "INSERT INTO `users` (login, password, email, hash, sexe, bio, orientation) VALUES (?, ?, ?, ?, ?, ?, ?)",
    //                     [res.login, bcrypt.hashSync(res.password, 10), res.email, crypto.randomBytes(20).toString('hex'), res.sexe, res.bio, res.orientation]);
    //             }
    //             else
    //                 console.log('USERNAME already used');
    //         }
    //         else
    //             console.log('EMAIL already used');
    //         console.log('HUM');
    //     });
    //     return new Promise(function (resolve) {
    //         resolve('loul');
    //         return ('loul');
    //     });
    // }
    //
    // socket.on('register', function (res) {
    //     console.log(res);
    //
    //     console.log(adduser(res));
    //
    //
    //     console.log("reg end");
    //     we should do async for bcrypt
    //
    //         });
    // })
}

module.exports = Controller;