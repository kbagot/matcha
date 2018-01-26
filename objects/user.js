let bcrypt = require('bcrypt');

class User {
    constructor() {
        this.data = {login: "motherfcker",
        password: '',
        email: '',
        valid: '',
        notif: '',
        sexe: '',
        bio: '',
        orientation: ''};
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
                        });
                        socket.emit('user', sess.data);
                }
                else
                    socket.emit('logpass');
            });
        }
        else
            socket.emit('loglog');
    }
}

module.exports = User;

