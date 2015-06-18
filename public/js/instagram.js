  var socket = io('http://ca45752e.ngrok.io');
  var count = 0;
  var photos = [];

  socket.on('connect', function() {
    console.log('Connected!');
  });

  socket.on('instagram', function(obj) {
    console.log(obj);
    $.ajax({
      url: obj.show,
      crossdomain: true,
      dataType: 'jsonp'
    })
    .done(function(response) {
      console.log(response);
        count++;
         if(photos.indexOf(response.data[0].id) === -1) {
           console.log('not on page');
           $('#photo-container').prepend('<li class="animated fadeInLeft"><img src="' + response.data[0].images.thumbnail.url + '"></li>');
           photos.push(response.data[0].id);
         } else {
           console.log('duplicate');
         };
    })
  })