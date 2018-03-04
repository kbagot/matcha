const fs = require('mz/fs');
const uniqid = require('uniqid');

class Profil {
    static mainHandler(db, sess, socket, data, io, setState){
        const menu = {
            upload: Profil.handleUpload,
            getImages: Profil.sendImages,
            getProfil: Profil.sendProfil
        };

        if (menu[data.type]){
            menu[data.type](db, sess, socket, data, io, setState);
        }
    }

    static async sendProfil(db, sess, socket, data, io, setState){
        const sql = "SELECT users.id, users.login, users.last, users.first, users.age, users.sexe, users.bio, users.orientation, users.tags, users.spop, users.date, location.city, location.country, location.zipcode, likes.user1, likes.user2, " +
            "(SELECT st_distance_sphere((SELECT POINT(lon, lat) FROM location WHERE logid = ?), (SELECT POINT(lon, lat) FROM location WHERE logid = ?))) AS distance " +
            "FROM users LEFT JOIN likes ON likes.user1 = users.id OR likes.user2 = users.id INNER JOIN location ON location.logid = users.id  WHERE users.id = ?";
        const [rows] = await db.execute(sql, [data.id, sess.data.id, data.id]);

        if (rows[0]){
            if (setState) {
                setState(rows[0]);
            } else {
                io.emit(data.id, rows[0]);
            }
        }
    }

    static async handleUpload(db, sess, socket, data, io){
        if (await fs.exists('img') && sess.data.img.length < 5){
            const id = `${uniqid()}.${data.ext}`;
            const sql = "INSERT INTO img SET userid= ?, imgid = ?, profil= ?";
            const profil = sess.data.img[0].imgid === `nopic${sess.data.sexe}.jpg`;
            const newPic = {imgid: id, profil: profil};

            await fs.writeFile(`img/${id}`, data.img, 'base64');
            await db.execute(sql, [sess.data.id, id, profil]);

            if (profil){
                sess.data.img = [newPic];
            } else {
                sess.data.img.push(newPic);
            }
            sess.save();
            socket.emit('user', sess.data);
            io.emit(sess.data.login, sess.data.img);

        }
    }

    static async sendImages(db, sess, socket, data, io, setState){
        const sql = "SELECT imgid, profil FROM img WHERE userid= ? ORDER BY profil DESC";
        const [rows] = await db.execute(sql, [data.profil.id]);

        rows.forEach(elem => elem.profil = elem.profil === 1);
        if (rows[0]){
            setState(rows);
        } else {
            setState([{imgid: `nopic${data.profil.sexe}.jpg`, profil: true}]);
        }
        // console.log(rows);
    }
}

module.exports = Profil;