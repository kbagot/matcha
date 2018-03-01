class Research {
    async request(opt, fct, db, sess) {
        try {
            let [req] = await db.query("SELECT * FROM users INNER JOIN location ON location.logid = users.id WHERE users.id = ?", [sess.data.id]);
            let usertag = '';
            let ordertag = '';
            let results = [];

            if (req[0].tags.length !== 0)
                req[0].tags.forEach((elem) => {
                    usertag += ', JSON_CONTAINS(tags, \'[\"' + elem + '\"]\') AS ' + elem + ' ';
                    ordertag += elem + '+';
                });

            let matchorder = '';
            if (ordertag && opt.match)
                matchorder = 'ORDER BY ' + ordertag + '0' + ' DESC';
            if (opt.dofirstmatch) {
                let i = 0;
                const j = ['', 'tags', 'distance'];
                opt[req[0].sexe] = req[0].sexe;
                opt[req[0].orientation] = req[0].orientation;
                opt.distance = '50';
                opt.tags = req[0].tags; // TODO reducteur de tags pour match
                opt.spop = req[0].spop;
                while (results.length <= 25 && i < 3) {
                    opt[j[i]] = '';
                    results = await Research.doRequest(opt, db, req, usertag, ordertag, matchorder);
                    i++;
                }
            } else
                results = await Research.doRequest(opt, db, req, usertag, ordertag, matchorder);
            opt.result = results;
            fct(opt);
        } catch (e) {
            console.log(e);
        }
    }

    static async doRequest(opt, db, req, usertag, ordertag, matchorder) {
        try {
            let order = '';
            let cnt = 0;
            for (let i in opt.order) {
                if (opt.order[i]) {
                    if (cnt === 0)
                        order += 'ORDER BY ';
                    if (cnt !== 0)
                        order += ',';
                    if (ordertag && i === 'tags') {
                        order += ordertag + '0' + ' ' + opt.order.tags; //add ordertag to order
                    }
                    else
                        order += i + ' ' + opt.order[i];
                    cnt++;
                }
            }
            if (opt.match)
                order = [matchorder, matchorder = order][0];
            if (!opt.distance)
                opt.distance = '20000';
            if (!opt.min)
                opt.min = '18';
            if (!opt.max)
                opt.max = '99';
            if (!opt.tags)
                opt.tags = [];
            if (!opt.hetero && !opt.bi && !opt.trans && !opt.gay) {
                opt.hetero = 'hetero';
                opt.bi = 'bi';
                opt.trans = 'trans';
                opt.gay = 'gay';
            }
            if (!opt.M && !opt.F && !opt.T) {
                opt.M = 'M';
                opt.F = 'F';
                opt.T = 'T';
            }
            let sql = "SELECT * FROM (SELECT *, (st_distance_sphere(POINT(lon, lat), POINT(?, ?)) / 1000) AS distance " + // TODO  care  maybe  have to be * looking on match result
                usertag +
                " from users INNER JOIN location ON location.logid = users.id  " +
                "HAVING orientation IN (?, ?, ?, ?)" +
                "AND distance < ? AND " +
                "sexe IN (?, ?, ?) AND JSON_CONTAINS(tags, ?)" +
                "AND (age >= ? AND age <= ?) " + order + " LIMIT " + opt.resultLength + " , 25) AS res " + matchorder;
            let inserts = [req[0].lon, req[0].lat, opt.hetero, opt.bi, opt.trans, opt.gay, opt.distance, opt.M, opt.F, opt.T, JSON.stringify(opt.tags), opt.min, opt.max];
            sql = db.format(sql, inserts);
            let [results] = await db.query(sql);
            return (results);
        } catch (e) {
            console.log(e);
        }
    }
}


module.exports = Research;