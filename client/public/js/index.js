$(function() {
  var apiHost = 'http://localhost:3000/';
  var cartridgeImageSrc = apiHost + 'image.jpg';

  $('.home-section').show();

  // start test
  $('.home-section-done-button').click(function() {
    $('.home-section, .test-section').hide(function() {
        $('.applySample-section').show();
    });
  });

  // stop test
  $('.applySample-section-close-button').click(function() {
    $.get(apiHost + 'stop', function(state) {
      $('.applySample-section, .test-section').hide(function() {
        $('.home-section').show();
      });
    });
  });

  var upateTestSection = function() {
    $('.cartridge-image').attr("src", cartridgeImageSrc + "?timestamp=" + new Date().getTime());
    drawLineChart();
  };
  
  setInterval(function() {
    //change to only call when test in progress
    upateTestSection();

    $.get(apiHost + 'state', function(state) {
      if(state == 'ready') {
        $('.applySample-section, .home-section').hide(function() {
          upateTestSection();
          $('.test-section').show();
        });
      }
    });

  }, 1000);
});
