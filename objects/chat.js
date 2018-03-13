let like = require('./likes');
let update = require('./update.js');

class Chat {
    async handleChat(data, socket, db, sess, allUsers){
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
                Chat.addMsg(data, db, sess);
                break ;
            case 'swapIndex':
                Chat.swapIndex(data.user, sess, socket);
                break ;
            case 'openChat':
                await update.openChat(db, data, sess, socket);
                socket.emit('user', sess.data);
                break ;
            case 'updateImg':
                Chat.updateImg(db, data, sess, socket);
                break ;
        }
    }

    static updateImg(db, data, sess, socket){
        if (sess.data.match){
            const index = sess.data.match.findIndex(elem => Number(elem.id) === Number(data.user.id));
            sess.data.match[index].imgid = data.user.img;
        }

        if (sess.data.chat){
            const index =  sess.data.chat.findIndex(elem => Number(elem.id) === Number(data.user.id));

            sess.data.chat[index].imgid = data.user.img;
        }
        sess.save();
        socket.emit('user', sess.data);
    }

    static swapIndex(user, sess, socket){
        if (sess.data.chat){
            const array = sess.data.chat;

            array[user] = array.splice(0, 1, array[user])[0];
            sess.data.chat = array;
            sess.save();
            socket.emit('user', sess.data);
        }
    }

    static handleNewMsg(data, socket, db, sess, allUsers){
        if (allUsers && allUsers.findIndex(elem => elem.login === data.to.login) !== -1){
            like.findSocket(db, data.to.id)
                .then(res => {
                    res.forEach((id) => {
                        socket.to(id).emit("chat", {type: 'newMsg', login: {login: sess.data.login, id: sess.data.id}, msg: data.msg});
                    })
                });
        } else {
            Chat.unreadMsg(data, socket, db, sess, false);
        }
    }

    static addMsg(data, db, sess){
        return new Promise((resolve, reject) => {
            let sendId = data.from.id;
            let selfId = data.to ? data.to.id : sess.data.id;
            let sql = "UPDATE chat SET history = JSON_MERGE((SELECT history FROM (SELECT history FROM chat " +
                "WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)) as lol), ?) " +
                "WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";

            db.execute(sql, [sendId, selfId, selfId, sendId, JSON.stringify([{from: sendId, msg: data.msg}]), sendId, selfId, selfId, sendId])
                .then(resolve())
                .catch(e => reject(e));
        });
    }

    static unreadMsg(data, socket, db, sess, online){
        let sql = "INSERT INTO notif (login, type, `from`) VALUES (?, ?, ?);";
        let selfId  = online ? sess.data.id : data.to.id;
        let sendId = data.from.id;

        Chat.addMsg(data, db, sess)
            .then(() => db.execute(sql, [selfId, 'message', sendId]))
            .then(() => {
            if (online){
                update.getNotif(db, sess)
                    .then(() => socket.emit('user', sess.data));
            }
        })
    }

    static updateList(db, data, sess, socket){
        if (!sess.data.chat){
            sess.data.chat = [data.login];

            update.openChat(db, data, sess, socket);
        } else {
            let index = sess.data.chat.findIndex(elem => elem.login === data.login.login);

            if (index === -1) {
                sess.data.chat.splice(0, 0, data.login);
                update.openChat(db, data, sess, socket);
            } else {
                sess.data.chat.splice(index, 1);
            }
        }
        sess.save();
        socket.emit('user', sess.data);
    }
}

module.exports = Chat;