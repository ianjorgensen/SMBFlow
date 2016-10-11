var spawn = require('child_process').spawn;
var parse = require('csv-parse');
var express = require('express');
var fs = require('fs');
var app = express();

var state = '';
var scriptPath = './scripts';
var dataFile = 'data.csv';

var imaging;

app.use(express.static('/mnt/'));

app.get('/start', function(req, res) {
  startImaging(req.query.path, req.query.pictures, req.query.delay, req.query.focus);
  res.send('done');
});

app.get('/state', function(req, res) {
  res.json(state);
});

app.get('/data', function(req, res) {
  fs.readFile(scriptPath + '/' + dataFile, 'utf8', (err, data) => {
    if(err) {
      res.json({error: err});
      return;
    }

    parse(data, {comment: '#'}, function(err, output){
      if(err) {
        res.json({error: err});
        return;
      }

      res.json(output);
    });
  });
});

app.get('/stop', function() {
  state = '';
  spawn(scriptPath +'kill_octave.sh');
  res.send();
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});

var startImaging = function(path, pictures, delay, focus) {
  var imaging = spawn('./scripts/tick.js', ['-v']);


  imaging.stdout.on('data', (data) => {
    var myRegexp = /\*(.*)\*/g;
    console.log(data.toString());
    match = myRegexp.exec(data.toString());

    if (match && match[1]) {
      state = match[1];
      console.log('set state to', state);
    }
  });

  imaging.stderr.on('data', (data) => {
    state = '';
    console.log(`stderr: ${data}`);
  });

  imaging.on('close', (code) => {
    state = '';
    console.log(`child process exited with code ${code}`);
  });
};
