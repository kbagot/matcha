 var     express = require('express');
var     app = express();
var     session = require('express-session');
var     bodyParser = require('body-parser');
var     http = require('http');
var     server = http.Server(app);
// var     reqsetup = require('./objects/config/setup');
// var     user = require('./objects/user');
// var     newUser = new user();

    app.use(session({
        secret : 'test',
        resave: 'false',
        saveUninitialized: 'false'
    }))
        .use(express.static('./views'))
        .use(express.static('./objects'))
        .use(express.static('./src'))
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({
            extended: true
        }))
        .get("/", function(req, res, next){
            res.sendFile(__dirname + '/src/index.html');
            // res.end();
        })
        .get("/dist/index_bundle.js", function(req, res, next){
            res.sendFile(__dirname + '/dist/index_bundle.js');
        })
        .use(function(req, res, next){
            res.writeHead(404, {"Content-Type" : "text/html"});
            res.write("<p>404 Not Found</p>");
            res.end();
        });

let io = require('socket.io').listen(server);

io.sockets.on('connection', async function(socket){
    console.log("Connected");
});



server.listen(8081);
