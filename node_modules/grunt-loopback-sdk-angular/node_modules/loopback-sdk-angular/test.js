var spawn = require('child_process').spawn;

console.log('start');
run(function(err) {
  console.log('done', err || 'ok');
});

function run(callback) {

  var env = require('util')._extend({}, process.env);
  delete env._;

  console.log('--ENV--');
  console.log(env);
  console.log('--END--');

  var child = spawn(
    process.execPath,
    [
      'test.e2e/test-server.js',
      'node_modules/karma/bin/karma',
      'start',
      '--single-run',
      '--browsers',
      'PhantomJS'
    ],
    {
      cwd: __dirname,
      env: env,
      stdio: ['ignore', 1, 2]
    });

  child.on('error', function(err) {
    callback(err);
  });
  child.on('exit', function(code) {
    if (code)
      callback(new Error('Failed with exit code ' + code));
    else
      callback();
  });
}

