var exec = require('child_process').exec;
var parse = require('csv-parse');
var express = require('express');
var cors = require('cors')

var fs = require('fs');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


var state = '';
var scriptPath = '/../../mnt';
var dataFile = 'output.csv';

var imaging;
var settings = {
  pictures: 200,
  delay: 5,
  focus: 30
};

app.use(express.static(scriptPath));
app.use(cors());

app.get('/start', function(req, res) {
  settings.path = 'flow' + '-' + Date.now();

  if (req.query.pictures)  settings.pictures = req.query.pictures;
  if (req.query.delay) settings.delay = req.query.delay;
  if (req.query.focus) settings.focus = req.query.focus;

  startImaging(settings);
  res.send('done');
});

app.get('/settings', function(req, res) {
  res.json(settings);
});

app.get('/state', function(req, res) {
  res.json(state);
});

app.get('/data', function(req, res) {
  fs.readFile(scriptPath + '/output/' + dataFile, 'utf8', (err, data) => {
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

app.get('/stop', function(req, res) {
  state = '';

  var tryTokillAll = function() {
    if(imaging) {
      exec('sudo pkill octave');
      var kill = 'sudo kill $(pgrep -P ' + imaging.pid + ')';
      console.log('kill', kill);
      exec(kill);
    }
  }

  setTimeout(tryTokillAll, 2000);
  tryTokillAll();
  res.send('true');
});

server.listen(80, function () {
  console.log('Running');
});

var startImaging = function(settings) {
  imaging = exec('sudo sh ~''/../../mnt/server/imaging.sh -i ' + settings.pictures + ' -d ' + settings.delay + ' -p ' + settings.path + ' -f ' + settings.focus,{gid:1234});

  imaging.stdout.on('data', (data) => {
    io.sockets.emit('stdout', data.toString().replace(/\n/g, '<br>'));
    var myRegexp = /\*(.*)\*/g;

    console.log(data.toString());

    match = myRegexp.exec(data.toString());

    if (match && match[1]) {
      state = match[1];
      console.log('set state to', state);
    }
  });

  imaging.stderr.on('data', (data) => {
    io.sockets.emit('stderr', data.toString().replace(/\n/g, '<br>'));
    console.log(`stderr: ${data}`);
  });

  imaging.on('close', (code) => {
    state = '';
    console.log(`child process exited with code ${code}`);
  });
};
