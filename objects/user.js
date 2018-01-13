let controller = require('./request');

class User {
    constructor(props) {
        console.log(props.server);
        this.controller = new controller(props);
        this.name = "Motherfucker !!!!!!!!!!!!";
    }
}

module.exports = User;

