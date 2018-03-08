const fs = require('mz/fs');
const uniqid = require('uniqid');
const register = require('./register.js');

class Profil {
    static mainHandler(db, sess, socket, data, io, setState){
        const menu = {
            upload: Profil.handleUpload,
            getImages: Profil.sendImages,
            getProfil: Profil.sendProfil,
            imgDel: Profil.deleteImage,
            profilImg: Profil.setProfilImg,
            editProfil: Profil.editProfil,
            visit: Profil.addVisit
        };

        if (menu[data.type]){
            menu[data.type](db, sess, socket, data, io, setState);
        }
    }

    static async addVisit(db, sess, socket, data, io){
        if (data.data.id !== sess.data.id) {
            const sql = "UPDATE visit SET visits = (JSON_MERGE((SELECT visits FROM (SELECT visits FROM visit WHERE userid = ?) AS lol), ?))";
            const json = {
                [sess.data.id]: Date.now()
            };

            db.execute(sql, [data.data.id, json]);
        }
    }

    static async editProfil(db, sess, socket, data, io){
        const profil = data.data;

        if (profil.tags) {
            data.data.tags.map(async (elem) => {
                if (elem.className) {
                    register.addTags(db, elem.value);
                }
            });
        }
        Object.keys(profil).map(elem => {
            if (profil[elem] === null || elem === 'edit' || (elem === 'orientation' && !register.checkOrientation(profil[elem])) || (elem === 'sexe' && !register.checkSexe(profil[elem]))){
                delete profil[elem];
            } else if (elem === 'tags'){
                profil[elem] = profil[elem].map((node, index) => profil[elem][index] = node.value);
            }
        });

        const empty = Object.values(profil);
        const sql = {
            age: profil.age  && profil.age >=18 && profil.age <= 99 && profil.age !== sess.data.age ? ' age = ? ' : null,
            last: profil.last && profil.last !== sess.data.last? ' last = ? ' : null,
            first: profil.first && profil.first !== sess.data.first ? ' first = ? ' : null,
            bio: profil.bio && profil.bio !== sess.data.bio ? ' bio = ? ' : null,
            sexe: profil.sexe && profil.sexe !== sess.data.sexe ? ' sexe = ? ' : null,
            orientation: profil.orientation  && profil.orientation !== sess.data.orientation ? ' orientation = ? ' : null,
            tags: profil.tags && profil.tags !== sess.data.tags ? 'tags = ? ' : null
        };

        if (empty[0]) {
            const query = "UPDATE users SET " +Object.values(sql).filter(elem => elem ).join() + "WHERE id = ?";

            await db.execute(query, [...empty, sess.data.id]);
            Object.assign(sess.data, profil);
            sess.save();
            socket.emit('user', sess.data);
            io.emit(sess.data.id, null);
        }

    }

    static async setProfilImg(db, sess, socket, data, io){
        const sql = "UPDATE img SET profil = (CASE WHEN profil='1' THEN '0' WHEN profil='0' THEN '1' END) WHERE userid=? AND (imgid = ? OR profil = 1)";
        const oldProfil = sess.data.img.findIndex(elem => elem.profil === true);
        const newProfil = sess.data.img.findIndex(elem => elem.imgid === data.img.imgid);

        await db.execute(sql, [sess.data.id, data.img.imgid]);

        sess.data.img[oldProfil] = sess.data.img.splice(newProfil, newProfil, sess.data.img[oldProfil])[0];
        sess.data.img[oldProfil].profil = true;
        sess.data.img[newProfil].profil = false;
        sess.save();
        io.emit(sess.data.login, sess.data.img);
    }

    static async deleteImage(db, sess, socket, data, io){
        const profil = data.img.profil ? " AND profil ='1'" : "";
        let sql = "DELETE FROM img WHERE imgid = ? AND userid = ?" + profil;

        await db.execute(sql, [data.img.imgid, sess.data.id]);
        if (data.img.profil){
            sql = "UPDATE img SET profil = 1 WHERE userid = ? LIMIT 1";
           await db.execute(sql, [sess.data.id]);
        }
        if (sess.data.img.length === 1){
            sess.data.img = [{imgid: `nopic${sess.data.sexe}.jpg`, profil: true}];
        } else {
            const index = sess.data.img.findIndex(elem => elem.imgid === data.img.imgid);

            sess.data.img.splice(index, 1);
            sess.data.img[0].profil = true;
        }
        sess.save();
        io.emit(sess.data.login, sess.data.img);
    }

    static async sendProfil(db, sess, socket, data, io, setState){
        const sql = "SELECT users.id, users.login, users.last, users.first, users.age, users.sexe, users.bio, users.orientation, users.tags, users.spop, users.date, location.city, location.country, location.zipcode, likes.user1, likes.user2, img.imgid, " +
            "(SELECT st_distance_sphere((SELECT POINT(lon, lat) FROM location WHERE logid = ?), (SELECT POINT(lon, lat) FROM location WHERE logid = ?))) AS distance " +
            "FROM users LEFT JOIN img ON img.userid = users.id AND img.profil = '1' LEFT JOIN likes ON likes.user1 = users.id OR likes.user2 = users.id INNER JOIN location ON location.logid = users.id  WHERE users.id = ?";
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

    static async sendImages(db, sess, socket, data, io){
        const sql = "SELECT imgid, profil FROM img WHERE userid= ? ORDER BY profil DESC";
        const [rows] = await db.execute(sql, [data.profil.id]);

        rows.forEach(elem => elem.profil = elem.profil === 1);
        if (rows[0]){
            io.emit(data.profil.login, rows);
        } else {
            io.emit(data.profil.login, [{imgid: `nopic${data.profil.sexe}.jpg`, profil: true}]);
        }
    }
}

module.exports = Profil;