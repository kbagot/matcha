let like = require('./likes');
let update = require('./update.js');

class Chat {
    handleChat(data, socket, db, sess, allUsers){
        switch (data.type){
            case 'newMsg':
                Chat.handleNewMsg(data, socket, db, sess, allUsers);
                break ;
            case 'chatList':
                Chat.updateList(db, data, sess, socket);
                break ;
            case 'unreadMsg':
                Chat.unreadMsg(data, socket, db, sess, true);
                break ;
            case 'readMsg':
                Chat.readMsg(data, socket, db, sess);
                break ;
        }
    }

    static handleNewMsg(data, socket, db, sess, allUsers){
        if (allUsers && allUsers.indexOf(data.login) !== -1){
            like.findSocket(db, data.login)
                .then(res => {
                    res.forEach((id) => {
                        socket.to(id).emit("chat", {type: 'newMsg', login: sess.data.login, msg: data.msg});
                        // temporary shit until history
                        // update.updateMsg(data.login, sess, data.msg);
                        // socket.emit('user', sess.data);
                        //shit end
                    })
                });
        } else {
            Chat.unreadMsg(data, socket, db, sess, false);
            // update.updateMsg(data.login, sess, data.msg);
            // socket.emit('user', sess.data);
        }
    }

    static readMsg(data, socket, db, sess){
        let login = data.from;
        let login2 = sess.data.login;
        let sql = "UPDATE chat SET history = JSON_MERGE((SELECT history FROM (SELECT history FROM chat WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)) as lol), ?) WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";

        db.execute(sql, [login, login2, login2, login, JSON.stringify([{from: login, msg: data.msg}]), login, login2, login2, login])
            .catch(e => console.log(e));
    }

    static unreadMsg(data, socket, db, sess, online){
        let sql = "INSERT INTO notif (login, type, `from`) VALUES (?, ?, ?);";
        let sql2 = 'UPDATE chat SET `from`= ? , messages = JSON_MERGE((SELECT messages FROM(SELECT messages FROM chat WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)) as lol), ?) WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)';
        let login  = online ? sess.data.login : data.login;
        let login2 = data.from;

        db.execute(sql, [login, 'message', login2])
            .then(() => db.execute(sql2, [login2, login, login2, login2, login, JSON.stringify([data.msg]), login, login2, login2, login ]))
            .then(() => {
            if (online){
                update.updateMsg(login2, sess, data.msg);
                socket.emit('user', sess.data);
            }
            })
    }

    static updateList(db, data, sess, socket){
        if (!sess.data.chat){
            sess.data.chat = [data.login];
            update.getChatLog(db, data, sess, socket);
        } else {
            let index = sess.data.chat.indexOf(data.login);

            if (index === -1) {
                sess.data.chat.push(data.login);
                update.getChatLog(db, data, sess, socket);
            } else {
                sess.data.chat.splice(index, 1);
            }
        }
        sess.save();
        socket.emit('user', sess.data);
    }


}

module.exports = Chat;