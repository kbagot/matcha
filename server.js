let     express = require('express');
let     app = express();
let     session = require('express-session');
let     bodyParser = require('body-parser');
let     http = require('http');
let     server = http.Server(app);
let     request = require('./objects/request');
let     controller = new request(server);
let     setup = require('./objects/config/setup.js');
let     test = 1;
let     set = new setup();

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
        .get("/setup", (req, res, next) => {
            set.setDatabase();
            res.redirect("/");
        })
        .get("/", function(req, res, next){
            res.sendFile(__dirname + '/src/index.html', (res) => res.end());
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

io.sockets.on('connection', function(socket){
    console.log("Connected from: " +socket.id);
    // socket.on('login', (data) => console.log(data));
    socket.on('disconnect', () => console.log('Disconnected from :'+socket.id));
});



server.listen(8081);
