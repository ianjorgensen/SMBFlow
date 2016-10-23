var Api = function(host) {
  return {
    start: function(cb) {
      $.get('http://' + host + '/start', cb);
    },
    stop: function(cb) {
      $.get('http://' + host + '/stop', cb);
    },
    data: function(cb) {
      $.get('http://' + host + '/data', cb);
    },
    state: function(cb) {
      $.get('http://' + host + '/state', cb);
    }
  }
};
