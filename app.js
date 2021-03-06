var express = require('express');
var app = express();
var server = require('http').createServer(app);
var morgan = require('morgan');
var port = process.env.PORT || 3000;
var router = express.Router();
var instagram = require('instagram-node-lib');
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

// how to use middleware in express - this will set the command to activate the middleware
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'ejs');

instagram.set('client_id', process.env.INSTAGRAM_CLIENT_ID);
instagram.set('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
instagram.set('callback_url', 'http://b056f2e8.ngrok.io/callback');
instagram.set('redirect_uri', 'http://b056f2e8.ngrok.io');
instagram.set('maxSockets', 100);

instagram.subscriptions.subscribe({
  object: 'tag',
  object_id: 'New York',
  aspect: 'media',
  callback_url: 'http://b056f2e8.ngrok.io/callback',
  type: 'subscription',
  id: '#' });

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
    var url = 'https://api.instagram.com/v1/tags/'+ tag.object_id + '/media/recent?client_id='+ process.env.INSTAGRAM_CLIENT_ID;
    sendMessage(url);
    });
    res.end();

});

function sendMessage(url){
  console.log('sendMessage');
  io.sockets.emit('instagram', {show:url});
};
