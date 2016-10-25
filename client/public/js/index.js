// change host here
var host = '10.0.1.82';
var state = '';

$(function() {
  var api = Api(host);

  show('.home');
  initRemoteConsole();

  $('.home button').click(function() {
    api.start(function() {
      state = 'started';
      show('.measurment', '.measurment-start');
    });
  });

  $('.removeCartridge button').click(function() {
    show('.home');
  });

  $('.measurment-cancel, .measurment-results-positive-button , .measurment-results-negative-button').click(function() {
    api.stop(function() {
      show('.removeCartridge');
    });
  });

  $('.measurment-photo-toggle input').change(function() {
    if (this.checked) {
      $('.measurment-results-chart').addClass('measurment-results-chart-shown');
      $('.measurment-cartridge').show(0);
    } else {
      $('.measurment-results-chart').removeClass('measurment-results-chart-shown');
      $('.measurment-cartridge').hide(0);
    }
  });

  $('.measurment-debug-toggle input').change(function() {
    if (this.checked) {
      $(".measurment-stdout").show(0);
    } else {
      $(".measurment-stdout").hide(0);
    }
  });

  var tick = function() {
    if (!state) {
      return;
    }

    //upate image
    $(".cartridge-image").attr("src","http://" + host + "/image_current.jpg?timestamp=" + new Date().getTime());

    api.state(function(state) {
      if(state.indexOf('info1') != -1) {
        show('.measurment', '.measurment-filling');
      }

      if(state.indexOf('info2') != -1) {
        show('.measurment', '.measurment-analyzing');
      }

      if(state.indexOf('info3') != -1) {
        api.data(function(data) {
          if (data[0] && data[0].length) {

            if (!$('.measurment-results').is(":visible")) {
              show('.measurment', '.measurment-results');
            }

            drawLineChart(data);
          }
        });
      }
    });
  };

  tick();
  setInterval(tick, 2000);
});

var initRemoteConsole = function() {
  var socket = io.connect('http://' + host);

  socket.on('stdout', function (data) {
    if (!state) {
      state = 'started';
      show('measurment', 'measurment-start');
    }

    $('.measurment-stdout').prepend(data);
  });
  socket.on('stderr', function (data) {
    $('.measurment-stdout').prepend('<span class="stderr">' + data + '</span>');
  });
};

var show = function(page, subPage) {
  $('.page').hide();
  $(page + '.page').show();

  if (subPage) {
    $('.page-sub').hide();
    $(subPage + '.page-sub').show();
  }
};
