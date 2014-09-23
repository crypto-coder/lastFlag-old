var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');

var app = module.exports = loopback();

// Set up the /favicon.ico
app.use(loopback.favicon());
app.use(loopback.logger(app.get('env') == 'development' ? 'dev' : 'default'));

// request pre-processing middleware
app.use(loopback.methodOverride());
app.use(loopback.compress());

// -- Add your pre-processing middleware here --

// boot scripts mount components like REST API
boot(app, __dirname);

// FROM LB EXAMPLE -- LoopBack REST interface
var apiPath = '/api';
app.use(loopback.cookieParser('secret'));
app.use(loopback.token({model: app.models.accessToken}));
app.use(apiPath, loopback.rest());


// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
//   var path = require('path');
app.use(loopback.static(path.resolve(__dirname, '../client')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
