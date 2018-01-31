class Likes{
    constructor(props){

    }

    handleLikes(data, chatUsers, socket, db, sess){

        console.log(sess);
        if (data.type === 'Add'){
            console.log("ADD");
            this.addLike(data.login, socket, chatUsers, db);
        }
        else if (data.type === 'Remove'){
            console.log("REMOVE");
            this.removeLike(data.login, socket, db);
        }
    }

    addLike(login, socket, chatUsers, db){
        let login2 = socket.handshake.session.data.login;
        let sql;

        this.likeExist(login, socket, db)
            .then((res) => {
                if (!res)
                {
                    sql = "INSERT INTO likes(user1, user2) VALUES (?, ?)";
                    db.execute(sql, [login2, login]);
                } else if (!res.matcha && res.user1 !== login2 ){
                    sql = "UPDATE likes SET matcha=true WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
                    db.execute(sql, [login, login2, login2, login]);
                }
            })
            .catch(() => console.log("Oups"));
    }

    removeLike(login, socket, db){
        let login2 = socket.handshake.session.data.login;
        let sql;

        console.log(login2);
        this.likeExist(login, socket, db).then((res) =>{
           if (res.matcha){
               sql = "UPDATE likes SET user1= (CASE WHEN user1=? THEN ? ELSE ? END), user2= (CASE WHEN user2=? THEN ? ELSE ? END), matcha=false";
               db.execute(sql, [login2, login, login, login, login2, login2]).catch((e) => console.log(e));
           } else {
               sql = "DELETE FROM likes WHERE user1=? AND user2=?";
               db.execute(sql, [login2, login]);
           }
        });
    }

    likeExist(login, socket, db){
        return new Promise((resolve, reject) => {
            let sql = "SELECT user1, user2, matcha FROM likes WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
            let login2 = socket.handshake.session.data.login;

            db.execute(sql, [login, login2, login2, login])
                .then(([rows, fields]) => { resolve(rows[0])
                })
                .catch(() => reject(false));
        });
    }
}

module.exports = Likes;