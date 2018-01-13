let database = require('./config/database'),
    db = new database('matcha');

class Controller {
    constructor(props) {
        console.log('wtf');
        let io = require('socket.io').listen(props);
        io.sockets.on('connection', function (socket, pseudo) {
            console.log('hello');
        });
    }

    async getUserName(userid, user) {
        let sql = "SELECT `login` FROM `users` WHERE `id` = ?";

        try {
            await db.con.execute(sql, [userid], function (error, res, fields) {
                user.login = res[0].login;
            });
        } catch (e) {
            console.log(e);
        }
    }

    createuser() {
        let sql = "INSERT INTO `users` (login, password, email, hash, sexe, bio, orientation) VALUES (?, ?, ?, ?, ?, ?, ?)";
    }
}

module.exports = Controller;