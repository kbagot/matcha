class Research {
    async request(opt, fct, db, sess) {
        try {
            // console.log(opt);
            let ord = opt.order;
            let [req] = await db.query("SELECT * FROM users INNER JOIN location ON location.login = users.login WHERE users.login = ?", [sess.data.login]);
            let usertag = '';
            let ordertag = '';

            req[0].tags.forEach((elem) => {
                usertag += ', JSON_CONTAINS(tags, \'[\"' + elem + '\"]\') AS ' + elem + ' ';
                ordertag += elem + '+';
            });
            let results = [];
            console.log(results.length);
            console.log(opt.match);
            let i = 0;
            let autoopt = [];
//  fill
//             console.log(opt);
            // console.log(opt);
            const j = ['tags', 'distance'];
            // autoopt.push(opt);
            // autoopt.push(Object.assign({}, opt, {tags: ''}));
            // autoopt.push(Object.assign({}, autoopt[1], {distance: ''}));
            // console.log(opt[j[0]]);
console.log(opt.match);
            if (opt.match) {
                opt[req[0].sexe] = req[0].sexe;
                opt[req[0].orientation] = req[0].orientation;
                opt.distance = '50';
                opt.tags = req[0].tags;
                   while (results.length < 10 && i < 3) {
                    console.log(results.length);
                    results = await this.doRequest(opt, db, req, usertag, ordertag);
                    opt[j[i]] = '';
                    i++;
                }
            } else
                results = await this.doRequest(opt, db, req, usertag, ordertag);
            fct({results, opt});
        } catch (e) {
            console.log(e);
        }
    }

    async doRequest(opt, db, req, usertag, ordertag) {
        try {
            let order = '';
            let cnt = 0;
            for (let i in opt.order) {
                if (opt.order[i]) {
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
            console.log(opt);
            if (!usertag)
                usertag = '\'\'';
            if (!order)
                order = '\'\'';
            // if no  avoid 0 result

            if (!opt.distance)
                opt.distance = '20000';
            if (!opt.min)
                opt.min = '18';
            if (!opt.max)
                opt.max = '99';
            console.log(opt.tags);
            if (!opt.tags)
            {console.log('WTFFFFFFFFFFF');
                opt.tags = [];}
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
            let sql = "SELECT *, (st_distance_sphere(POINT(lon, lat), POINT(?, ?)) / 1000) AS distance " +
                usertag +
                "from users INNER JOIN location ON location.login = users.login  " +
                "HAVING orientation IN (?, ?, ?, ?)" +
                "AND distance < ? AND " +
                "sexe IN (?, ?, ?) AND JSON_CONTAINS(tags, ?)" +
                "AND (age >= ? AND age <= ?) ORDER BY " + order;
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