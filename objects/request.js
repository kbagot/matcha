let database = require('./config/database'),
    db = new database('matcha');

let Controller = function(){
};


Controller.prototype.getUserName = async function (userid, user ){
    let     sql = "SELECT login FROM users WHERE id = ?";

    try {
        await db.con.execute(sql, [userid], function(error, res, fields){
            user.login = res[0].login;
        });
    }catch(e){
        console.log(e);
    }
};

module.exports = Controller;