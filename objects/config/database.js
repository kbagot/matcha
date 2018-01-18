class Database {
    constructor(props) {
        this.host = "localhost";
        this.port = "3306";
        this.database = "matcha";
        this.user = "root";
        this.password = "";
        this.multipleStatements = true;
        // this.database = props ? props.db : null;
    }
}

module.exports = Database;
