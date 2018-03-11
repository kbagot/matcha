class Loadhome {
    async request(opt, fct, db, sess) {
        try {
            let [maxspop] = await db.query("SELECT MAX(spop) AS maxspop FROM users");
            let [req] = await db.query("SELECT * FROM users INNER JOIN location ON location.logid = users.id WHERE users.id = ?", [sess.data.id]);

            let sort = '';
            if (opt === 'star')
                sort = "ORDER BY spop DESC LIMIT 4";
            else
                sort = "WHERE users.id IN (?)";
            let sql = "SELECT users.login, users.first, users.age, users.sexe, users.bio, users.orientation, " +
                "users.tags, ROUND(users.spop / ?) AS spop, users.date, location.city, location.country, location.zipcode, img.imgid, users.id, likes.user1, likes.user2, likes.matcha, " +
                "(st_distance_sphere(POINT(lon, lat), POINT(?, ?)) / 1000) AS distance " +
                " from users INNER JOIN location ON location.logid = users.id LEFT JOIN img ON img.userid = users.id AND (img.profil = 1) " +
                "LEFT JOIN likes ON ((likes.user2 = " + req[0].id + " AND likes.user1 = users.id) OR (likes.user1 = " + req[0].id + " AND likes.user2 = users.id))" +
                sort;
            // if (opt.task === 'visits') {
            let inserts = [maxspop[0].maxspop / 10, req[0].lon, req[0].lat, opt];
            sql = db.format(sql, inserts);
            let [results] = await db.query(sql);
            fct(results);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = Loadhome;