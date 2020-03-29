const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const bodyParser = require('body-parser');

const app = express();

const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(expressSanitizer());
app.use(express.urlencoded({ extended: false }));
app.use('/views', express.static('/views'));

app.use(express.static(path.join(__dirname, 'resources')));

app.use(bodyParser.urlencoded({ extended: false }));

// Override the form POST method so that PUT, DELETE, and PATCH requests can be sent
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Base url
const api = '/api/v1'

// Get JavaScript files from the routes folder to use them as routes
const indexRouter = require('./routes/index');
const aboutRouter = require('./routes/about');
const flightsRouter = require('./routes/flights');
const passengersRouter = require('./routes/passengers');
const helpRouter = require('./routes/help');

app.use('/', indexRouter);
app.use(api + '/help', helpRouter);
app.use(api + '/about', aboutRouter);
app.use(api + '/flights', flightsRouter);
app.use(api + '/passengers', passengersRouter);

// Use http to create server
const http = require('http');

// Use either port received from process.env.PORT or 3000
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Generated a nodejs server for Swagger UI using the Swagger Editor

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, 'nodejs-server-server/swagger.json'),
  controllers: path.join(__dirname, 'nodejs-server-server/controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document
var spec = fs.readFileSync(path.join(__dirname,'nodejs-server-server/api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  app.use(middleware.swaggerMetadata());

  app.use(middleware.swaggerValidator());

  app.use(middleware.swaggerRouter(options));

  app.use(middleware.swaggerUi());

  http.createServer(app).listen(port, function () {
    console.log("Listening on port " + port);
  });

});

//See if it's possible to parse port and decide to use process.env.PORT or hardcoded port based on the result
function normalizePort(val) {
  const port = parseInt(val, 10);

  //Use port received from process.env.PORT 
  if (isNaN(port)) {
    return val;
  }

  //Use hardcoded port
  if (port >= 0) {
    return port;
  }

  return false;
}

module.exports = app;
