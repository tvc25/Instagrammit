var express = require('express');
var app = express();
var server = require('http').createServer(app);
var morgan = require('morgan');
var port = process.env.PORT || 3000;
var router = express.Router();
var instagram = require('instagram-node-lib');
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

instagram.set('client_id', process.env.INSTAGRAM_CLIENT_ID);
instagram.set('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
instagram.set('callback_url', 'http://ca45752e.ngrok.io/callback');
instagram.set('redirect_uri', 'http://ca45752e.ngrok.io');
instagram.set('maxSockets', 100);

instagram.subscriptions.subscribe({
  object: 'tag',
  object_id: 'blue',
  aspect: 'media',
  callback_url: 'http://ca45752e.ngrok.io/callback',
  type: 'subscription',
  id: '#' });

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.render('index');
});


app.use('/', router);

server.listen(port, function () {
  console.log("Running");
});

io.sockets.on('connection',function(socket){
  socket.emit('connected');
  socket.on('chat',function(data){
    console.log(data)
  })
})

//you need a handshake between the two sides to get the data
app.get('/callback', function(request, response){
  instagram.subscriptions.handshake(request, response); 
});

app.post('/callback', function(req, res){
  var data = req.body;
  console.log(data)
  data.forEach(function(tag){
    var url = 'https://api.instagram.com/v1/tags/'+ tag.object_id + '/media/recent?client_id='+ 'c3a604574d5b44149951f4173d1f9a4b';
    sendMessage(url);
    });
    res.end();

});

function sendMessage(url){
  console.log('sendMessage');
  io.sockets.emit('instagram', {show:url});
};
