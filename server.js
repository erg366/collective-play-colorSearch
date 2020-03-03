// Create server
let port = process.env.PORT || 80;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

let outputClients = [];

app.get('/status', function(req, res) {
  res.json({
    output_clients: outputClients
  })
})

// Tell server where to look for files
app.use(express.static('public'));

// Create socket connection
let io = require('socket.io').listen(server);

// Clients in the output namespace
var outputs = io.of('/output');
// Listen for output clients to connect
outputs.on('connection', function (socket) {
  console.log('An output client connected: ' + socket.id);
    
  socket.on('selected', function (data) {
      outputClients.push({
          id: socket.id,
          colorData: data
      });
  });

  // Listen for this output client to disconnect
  socket.on('disconnect', function () {
    console.log("An output client has disconnected " + socket.id);
  });
});

// Clients in the input namespace
let inputs = io.of('/input');
// Listen for input clients to connect
inputs.on('connection', function (socket) {
  console.log('An input client connected: ' + socket.id);
    
  if (outputClients.length > 1) {
      // Listen for data messages
      socket.on('data', function (data) {

        // Send data to all clients
        outputs.emit('data', data);
      });

  }

});


