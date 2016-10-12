#!/usr/bin/env node
var fs = require('fs');

console.log('running', process.argv);

var i = 1;

fs.writeFile('./scripts/data.csv', "seconds,c,t\n", function(){
  setInterval(function() {
    console.log('interval', i++);
    fs.appendFile('./scripts/data.csv', i*5 + ',' + 10*Math.random() + ',' + 10*Math.random() + '\n', function (err) {});
    if(i > 5) {
        console.log('*info', i, '*');
    }
  }, 1000);
});
