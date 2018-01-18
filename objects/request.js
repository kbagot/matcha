let database = require('./config/connect'),
    db = new database('matcha'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt');

class Controller {
    constructor(props) {
        let io = require('socket.io').listen(props);
        io.on('connection', function (socket) {
            socket.on('login', function (res) {
                console.log(res);
                db.con.execute(
                    "SELECT `password` FROM `users` WHERE login=?",
                    [res.login],
                    function (err, results, fields) {
                        console.log(results); // results contains rows returned by server
                        console.log(fields);
                        console.log(err);
                        bcrypt.compare(res.password, results[0].password, function (err, suc) {
                            if (suc)
                                console.log('log success');
                            else
                                console.log('log fail');
                        });
                    });
                console.log('log end');
            });

            socket.on('register', function (res) {
                console.log(res);

                //we should do async for bcrypt
                db.con.execute(
                    "SELECT email FROM `users` WHERE `email`=?",
                    [res.email],
                    function (err, results, fields) {
                        console.log(results); // results contains rows returned by server
                        console.log(fields);
                        console.log(err);
                        if (!results[0]) {
                            db.con.execute(
                                "SELECT login FROM `users` WHERE `login`=?",
                                [res.login],
                                function (err, results, fields) {
                                    console.log(results); // results contains rows returned by server
                                    console.log(fields);
                                    console.log(err);
                                    if (!results[0]) {
                                        db.con.execute(
                                            "INSERT INTO `users` (login, password, email, hash, sexe, bio, orientation) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                            [res.login, bcrypt.hashSync(res.password, 10), res.email, crypto.randomBytes(20).toString('hex'), res.sexe, res.bio, res.orientation],
                                            function (err, results, fields) {
                                                console.log(results); // results contains rows returned by server
                                                console.log(fields);
                                                console.log(err);
                                            });
                                    }
                                    else
                                        console.log('USERNAME already used');
                                });
                        }
                        else
                            console.log('EMAIL already used');
                    });
            });
        })
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
}

module.exports = Controller;