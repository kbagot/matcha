class Likes{

    handleLikes(data, socket, db, sess){

        switch(data.type){
            case 'Add':
                Likes.addLike(data.login, socket, db, sess);
                break;
            case 'Remove':
                Likes.removeLike(data.login, socket, db, sess);
                break ;
            case 'addMatch':
                Likes.addMatchList(socket, db, sess, data.login, false);
                break;
            case 'delMatch':
                Likes.deleteMatchList(socket, db, sess, data.login, false);
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
                } else if (!res.matcha && res.user1 !== login2 ){
                    sql = "INSERT INTO chat(user1, user2, messages) SELECT ?, ? , '[]' WHERE NOT EXISTS (SELECT user1 FROM chat WHERE (user1= ? AND user2=?) OR (user1=? AND user2=?)) LIMIT 1";
                    db.execute(sql, [login, login2, login, login2, login2, login]).catch(e => console.log(e));
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
            if (res.matcha){
               sql = "UPDATE likes SET matcha=false ,user1= (CASE WHEN user1=? THEN ? ELSE ? END), user2= (CASE WHEN user2=? THEN ? ELSE ? END) WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
               db.execute(sql, [login2, login, login, login, login2, login2, login, login2, login2, login])
                   .then(() => Likes.deleteMatchList(socket, db, sess, login, true));
           } else {
               sql = "DELETE FROM likes WHERE user1=? AND user2=?";
               db.execute(sql, [login2, login]);
           }
        })
            .catch((e) => console.log("OupsREmove"));
    }

    static likeExist(login, sess, db){
        return new Promise((resolve, reject) => {
            let sql = "SELECT user1, user2, matcha FROM likes WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
            let login2 = sess.data.login;

            db.execute(sql, [login, login2, login2, login])
                .then(([rows, fields]) => { resolve(rows[0])
                })
                .catch(() => reject(false));
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