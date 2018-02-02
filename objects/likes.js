class Likes{

    handleLikes(data, socket, db, sess){

        if (data.type === 'Add'){
            Likes.addLike(data.login, socket, db, sess);
        }
        else if (data.type === 'Remove'){
            Likes.removeLike(data.login, socket, db, sess);
        }
        this.test = "caca";
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
                    sql = "UPDATE likes SET matcha=true WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
                    db.execute(sql, [login, login2, login2, login])
                        .then(() => Likes.addMatchList(socket, db, sess, login))
                        .catch((e) => console.log(e));
                }
            })
            .catch(() => console.log("Oups"));
    }

    static removeLike(login, socket, db, sess){
        let login2 = sess.data.login;
        let sql;

        Likes.likeExist(login, sess, db)
            .then((res) =>{
            if (res.matcha){
               sql = "UPDATE likes SET matcha=false ,user1= (CASE WHEN user1=? THEN ? ELSE ? END), user2= (CASE WHEN user2=? THEN ? ELSE ? END) WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
               db.execute(sql, [login2, login, login, login, login2, login2, login, login2, login2, login])
                   .then(() => Likes.deleteMatchList(socket, db, sess, login));
           } else {
               sql = "DELETE FROM likes WHERE user1=? AND user2=?";
               db.execute(sql, [login2, login]);
           }
        })
            .catch((e) => console.log(e));
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

    static addMatchList(socket, db, sess, login){
        if (!sess.data.chat){
            sess.data.chat = [login];
        }
        else if (sess.data.chat.indexOf(login) === -1){
            sess.data.chat.push(login);
        }
        sess.save();
        Likes.findSocket(db, login).then((res) =>{
            socket.emit("chatUsers", {type: 'refresh', login: login, chat: sess.data.chat, socket: res});
        });
    }

    static deleteMatchList(socket, db, sess, login){
        let index;

        if (sess.data.chat && (index = sess.data.chat.indexOf(login)) !== -1){
            sess.data.chat.splice(index, 1);
            sess.save();
        }
    }

}

module.exports = Likes;