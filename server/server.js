var loopback = require('loopback');
var boot = require('loopback-boot');

var otapi = require('../node_modules/node-otapi/node_otapi');

var app = module.exports = loopback();


// Set up the /favicon.ico
app.use(loopback.favicon());
app.use(loopback.logger(app.get('env') == 'development' ? 'dev' : 'default'));

// request pre-processing middleware
//app.use(loopback.methodOverride());
app.use(loopback.compress());

// -- Add your pre-processing middleware here --
app.use(loopback.token({ model: app.models.accessToken }));

// boot scripts mount components like REST API
boot(app, __dirname);

// FROM LB EXAMPLE -- LoopBack REST interface
//var apiPath = '/api';
//app.use(loopback.cookieParser('secret'));
//app.use(loopback.token({model: app.models.accessToken}));
//app.use(apiPath, loopback.rest());


// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
var path = require('path');
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

      //Start the OTAPI indicating the wallet password and default server / user ids
      otapi.startOTAPI('password');
      otapi.mainServerID = 'y0ca6JVtYSZuj1etoABAsaNJsU2Kb35AjeQZyZ0YCCF';
      otapi.mainUserID = 'ya1AQQmaWnuntmDnoOjCmKpPXhmGuVAfkPwrgSc3nlf';

      app.emit('started');
      console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}




//Attempt to stop the OTAPI at the exit of the node process
//This may need to be more closely bound to the start/stop of the web server
process.on('exit', function(code) {
    console.log('###### EXITING ######');
    otapi.stopOTAPI();
});
process.on('SIGUSR2', function(code) {
    console.log('###### CAUGHT SIGUSR2 ######');
    otapi.stopOTAPI();
});

/*
process.on('uncaughtException', function(err) {
    console.log(err);
    console.log(err.data)
    console.log('###### UNCAUGHT EXCEPTION ######');
    process.exit(1);
});
*/

