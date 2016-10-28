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
var scriptPath = './scripts';
var dataFile = 'output.csv';

var imaging;
var settings = {
  pictures: 200,
  delay: 5,
  focus: 30
};

app.use(express.static(scriptPath + '/output'));
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
  res.json([["Time (s)","Control line","Test line"],["0.000000","0.000000","0.000000"],["5.000000","0.000000","0.000000"],["10.000000","0.000000","0.000000"],["15.000000","0.000000","0.000000"],["20.000000","0.000000","0.000000"],["25.000000","0.000000","0.000000"],["30.000000","0.000000","0.000000"],["35.000000","0.000000","0.000000"],["40.000000","0.000000","0.000000"],["45.000000","0.000000","0.000000"],["50.000000","0.000000","0.000000"],["55.000000","0.000000","-0.070313"],["60.000000","0.000000","-0.082294"],["65.000000","0.000000","-0.008515"],["70.000000","0.000000","-0.046432"],["75.000000","0.000000","-0.057573"],["80.000000","0.234915","0.017054"],["85.000000","0.637754","0.000599"],["90.000000","1.080506","-0.013603"],["95.000000","1.235274","0.006532"],["100.000000","1.436057","0.017495"],["105.000000","1.791401","0.043076"],["110.000000","1.877036","0.023015"],["115.000000","1.985542","0.062145"],["120.000000","2.196969","0.037657"],["125.000000","2.259655","0.035398"],["130.000000","2.668566","0.015018"],["135.000000","2.766234","0.092604"],["140.000000","2.896408","0.020329"],["145.000000","2.997602","0.019273"],["150.000000","3.207555","0.068416"],["155.000000","3.317364","0.074000"],["160.000000","3.623791","0.098124"],["165.000000","3.647337","0.119541"],["170.000000","3.739521","0.099131"],["175.000000","4.009675","0.093864"],["180.000000","4.057844","0.109125"],["185.000000","4.231735","0.134906"],["190.000000","4.621217","0.170387"],["195.000000","4.548128","0.169861"]]);
});

app.get('/datas', function(req, res) {
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
  setTimeout(tryTokillAll, 2000);
  exec('echo "1" > /sys/class/gpio/gpio17/value');
  tryTokillAll();
  res.send('true');
});

server.listen(80, function () {
  console.log('Running');
});

var startImaging = function(settings) {
  tryTokillAll();

  imaging = exec('sudo node ./scripts/tick.js',{gid:1234});
  //imaging = exec('sudo sh ~' + scriptPath + '/server/imaging.sh -i ' + settings.pictures + ' -d ' + settings.delay + ' -p ' + settings.path + ' -f ' + settings.focus,{gid:1234});

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

var tryTokillAll = function() {
  if(imaging) {
    exec('sudo pkill octave');
    var kill = 'sudo kill $(pgrep -P ' + imaging.pid + ')';
    console.log('kill', kill);
    exec(kill);
  }
}
