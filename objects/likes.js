let update = require('./update.js');

class Likes{

    handleLikes(data, socket, db, sess, allUsers){

        switch(data.type){
            case 'Add':
                Likes.addLike(data.login, socket, db, sess);
                Likes.sendNotif(db, data.login, socket, allUsers);
                break;
            case 'Remove':
                Likes.removeLike(data.login, socket, db, sess);
                Likes.sendNotif(db, data.login, socket, allUsers);
                break ;
            case 'addMatch':
                Likes.addMatchList(socket, db, sess, data.login, false);
                break;
            case 'delMatch':
                Likes.deleteMatchList(socket, db, sess, data.login, false);
                break ;
            case 'refresh':
                update.getNotif(db, sess).then(() => socket.emit('user', sess.data));
                break ;
        }
    }

    static addLike(login, socket, db, sess){
        let login2 = sess.data.login;
        let sql;

        Likes.likeExist(login, sess, db)
            .then((res) => {
                if (!res)
                {
                    sql = "INSERT INTO likes(user1, user2) VALUES (?, ?)";
                    db.execute(sql, [login2, login]);
                    Likes.addNotif(db, sess, 'like', login, login2);
                } else if (!res.matcha && res.user1 !== login2 ){
                    Likes.addNotif(db, sess, 'match', login, login2);
                    sql = "INSERT INTO chat(user1, user2, history) SELECT ?, ? , '[]' WHERE NOT EXISTS (SELECT user1 FROM chat WHERE (user1= ? AND user2=?) OR (user1=? AND user2=?)) LIMIT 1";
                    db.execute(sql, [login, login2, login, login2, login2, login])
                        .catch(e => console.log(e));
                    sql = "UPDATE likes SET matcha=true WHERE (user1=? AND user2=?) OR (user1=? AND user2=?); " ;
                    db.execute(sql, [login, login2, login2, login])
                        .then(() => Likes.addMatchList(socket, db, sess, login, true))
                        .catch((e) => console.log(e));
                }
            })
            .catch((e) => console.log(e));
    }

    static removeLike(login, socket, db, sess){
        let login2 = sess.data.login;
        let sql;

        Likes.likeExist(login, sess, db)
            .then((res) =>{
            if (res && res.matcha){
                Likes.addNotif(db, sess, 'unmatch', login, login2);
                sql = "UPDATE likes SET matcha=false ,user1= (CASE WHEN user1=? THEN ? ELSE ? END), user2= (CASE WHEN user2=? THEN ? ELSE ? END) WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
               db.execute(sql, [login2, login, login, login, login2, login2, login, login2, login2, login])
                   .then(() => Likes.deleteMatchList(socket, db, sess, login, true));
           } else {
                Likes.addNotif(db, sess, 'unlike', login, login2);
                sql = "DELETE FROM likes WHERE user1=? AND user2=?";
               db.execute(sql, [login2, login]);
           }
        })
            .catch((e) => console.log(e));
    }


    static sendNotif(db, login, socket, allUsers){
        if (allUsers.indexOf(login) !== -1){
            Likes.findSocket(db, login)
                .then(res => {
                    res.forEach(id => {
                        socket.to(id).emit('match', {type: 'refresh'});
                    })
                })
        }
    }

    static likeExist(login, sess, db){
        return new Promise((resolve, reject) => {
            let sql = "SELECT user1, user2, matcha FROM likes WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
            let login2 = sess.data.login;

            db.execute(sql, [login, login2, login2, login])
                .then(([rows, fields]) => {
                    resolve(rows[0])
                })
                .catch((e) => reject(e));
        });
    }

    static findSocket(db, login){
        return new Promise((resolve, reject) => {
            let sql = "SELECT data FROM sessions";
            let res = [];

            db.execute(sql).then(([rows, fields]) => {
                for (let elem of rows){
                    let cookie = JSON.parse(elem.data);

                    if (cookie.data && cookie.data.login === login) {
                        res.push(cookie.socketid);
                    }
                }
                resolve(res);
            });
        }) ;
    }


    static addNotif(db, sess, type, login, login2){
        let sql =  "INSERT INTO notif SET type = ?, login = ?, `from` = ?";

        db.execute(sql, [type, login, login2]);
    }

    static addMatchList(socket, db, sess, login, refresh){
        if (!sess.data.match || (sess.data.match && sess.data.match.indexOf(login) === -1))
        {
            if (!sess.data.match){
                sess.data.match = [login];
            } else {
                sess.data.match.push(login);
            }
            sess.save(() => {
                socket.emit('user', sess.data);
                if (refresh) {
                    Likes.findSocket(db, login).then((res) => {
                        for (let elem of res) {
                            socket.to(elem).emit('match', {type: 'addMatch', login: sess.data.login});
                        }
                    });
                }
            });
        }
    }

    static deleteMatchList(socket, db, sess, login, refresh){
        let index;

        if (sess.data.match && (index = sess.data.match.indexOf(login)) !== -1){
            sess.data.match.splice(index, 1);
            sess.save(() => {
                socket.emit('user', sess.data);
                if (refresh) {}{
                    Likes.findSocket(db, login).then((res) => {
                        for (let elem of res) {
                            socket.to(elem).emit('match', {type: 'delMatch', login: sess.data.login});
                        }
                    });
                }
            });
        }
    }
}

module.exports = Likes;