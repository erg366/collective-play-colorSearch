// Asking for permision for motion sensors on iOS 13+ devices
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  document.body.addEventListener('click', function () {
    DeviceOrientationEvent.requestPermission();
    DeviceMotionEvent.requestPermission();
  })
}

// Open and connect input socket
let socket = io('/input');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(10)
}

function draw(){
  background(255);
  noStroke();
  fill(0);

  // Map rotation to x,y location on the screen
  let x = map(rotationY, -90, 90, 0, width);
  let y = map(rotationX, -90, 90, 0, height);
    
  ellipse(x, y, 20, 20);

  // Send tilt angles as normalized x,y coordinates
  socket.emit('data', {x: x / width, y: y / height});
  console.log('data', { x: x / width, y: y / height });
}


// function setup() {
//   createCanvas(100, 100, WEBGL);
// }

// function draw() {
//   background(200);
//   rotateZ(radians(rotationZ));
//   rotateX(radians(rotationX));
//   rotateY(radians(rotationY));
//   box(200, 200, 200);
// }