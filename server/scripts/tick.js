#!/usr/bin/env node
console.log('hi', process.argv);

var i = 1;
setInterval(function() {
  console.log('asdfasdf *tick', i++, '* sadfasfd');
}, 1000);
