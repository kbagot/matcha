let bcrypt = require('bcrypt');

class User {
    constructor(props) {
        this.socket = props.socket;
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
        // console.log(this.socket);
        console.log('LOGIN');
        const [results, fields] = await db.con.execute(
            "SELECT * FROM `users` WHERE login=?",
            [res.login]);
        // console.log(results); // results contains rows returned by server
        // console.log(fields);
        // console.log(err);
        if (results[0]) {
            bcrypt.compare(res.password, results[0].password, (err, succ) => {
                if (succ) {
                    for (let i in this.data)
                        this.data[i] = results[0][i];
                }
                else
                    this.socket.emit('logpass');
            });
        }
        else
            this.socket.emit('loglog');
    }

}

module.exports = User;

