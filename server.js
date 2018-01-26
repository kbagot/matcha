let     express = require('express');
let     app = express();
let     session = require('express-session');
let     bodyParser = require('body-parser');
let     http = require('http');
let     server = http.Server(app);
let     request = require('./objects/request');
let     setup = require('./objects/config/setup.js');
let     set = new setup();
let     controller = new request(server);

app.use(session({
            secret : 'w3ll3w',
            name : 'Session',
            resave: 'false', // uselles ??
            saveUninitialized: 'false' //usefull ?
          })
        )
        .use(session({
            // console.log(session)
        }))
        .use(express.static('./views'))
        .use(express.static('./objects'))
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({
            extended: true
        }))
        // .enable('trust proxy')
        .get("/setup", (req, res, next) => {
            set.setDatabase();
            res.redirect("/");
        })
        .get("/", function(req, res, next){
            controller.updateSession(req.session);
            res.sendFile(__dirname + '/src/index.html');
        })
        .get("/dist/index_bundle.js", function(req, res, next){
            res.sendFile(__dirname + '/dist/index_bundle.js');
        })
        .use(function(req, res, next){
            res.writeHead(404, {"Content-Type" : "text/html"});
            res.write("<p>404 Not Found</p>");
            res.end();
        });

server.listen(8081);
