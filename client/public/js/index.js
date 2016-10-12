var apiHost = 'http://10.0.1.115/';
var totalSeconds = 200 * 5;
var cartridgeImageSrc = apiHost + 'image_current.jpg';

$(function() {
  // subscribe to imaging console output
  var socket = io.connect(apiHost);
  socket.on('stdout', function (data) {
    console.log(data);
    $('.test-section-stdout').prepend(data);
  });
  socket.on('stderr', function (data) {
    console.log(data);
    $('.test-section-stdout').prepend('<span class="stderr">' + data + '</span>');
  });
  // get imaging script settings
  $.get(apiHost + 'settings', function(state) {
    totalSeconds = state.pictures * state.delay;
  });
  // init display home section
  $('.home-section').show(0);
  // start test
  $('.home-section-done-button').click(function() {
    $.get(apiHost + 'start', function(state) {
      $('.home-section, .test-section').hide(0,function() {
        $('.applySample-section').show(0);
      });
    });
  });
  // stop test
  $('.applySample-section-close-button').click(function() {
    $.get(apiHost + 'stop', function(state) {
      $('.applySample-section, .test-section').hide(0,function() {
        $('.home-section').show(0);
        $('.applySample-section h1').html('apply sample');
      });
    });
  });
  // toggle view image
  $('.test-section-toggle-image').change(function() {
    if (this.checked) {
      $(".cartridge").show(0);
    } else {
      $(".cartridge").hide(0);
    }
  });
  // toggle view console output
  $('.test-section-toggle-debug').change(function() {
    if (this.checked) {
      $(".test-section-stdout").show(0);
    } else {
      $(".test-section-stdout").hide(0);
    }
  });

  var upateTestSection = function() {
    $(".cartridge-image").attr("src", cartridgeImageSrc + "?timestamp=" + new Date().getTime());
    drawLineChart();
  };

  setInterval(function() {
    //change to only call when test in progress
    upateTestSection();
    $.get(apiHost + 'state', function(state) {
      if(!state) {
        return;
      }

      // filling detected
      if(state.indexOf('info1') != -1) {
        $('.applySample-section h1').html('filling');
      }
      // ready to display data
      if(state.indexOf('info3') != -1) {
        // show chart section
        $('.applySample-section, .home-section').hide(0, function() {
          upateTestSection();
          $('.test-section').show(0);
        });
      }
    });
  }, 1000);
  
  upateTestSection();
});
