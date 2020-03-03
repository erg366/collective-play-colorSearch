// Open and connect input socket
let socket = io('/output');

let isColorChosen = false;
let isGameEnded = false;

const SPACEBAR_KEYCODE = 32

// Listen for confirmation of connection
socket.on('connect', function () {
  console.log("Connected");
});

let radius;
let allPix = [];

let currentH = 0;
let currentS = 0;

let myX = 0;
let myY = 0;

let usX = 0;
let usY = 0;

let isColorWheelDrawn = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(15)
  if (width < height) {
      radius = width/2;
  } else {
      radius = height/2;
  }
  textAlign(CENTER);
  colorMode(HSB);
  
  translate(width/2, height/2);
  
  for (let x = 0; x < width; x++) {
    allPix[x] = []; 
    for (let y = 0; y < height; y++) {
      let p = createVector(x - width/2, y - height/2);
      let d = abs(dist(0,0,x-width/2,y-height/2));
      
      if (d < radius) {
        let h = degrees(p.heading())+180;
        let s = d/2;
        
        allPix[x].push(new Pix(h,s));
      }
      
      else {
        allPix[x].push(new Pix(0,0));
      }
    }
  }
  
  translate(-width/2, -height/2);

  // Listen for message
  socket.on('data', function (data) {
    if (!isGameEnded) {
      usX = Math.floor(data.x * width);
      usY = Math.floor(data.y * height);
      currentH = allPix[usX][usY].hue;
      currentS = allPix[usX][usY].sat;
    }
  });
}

function draw() {
    if (!isColorChosen) {
      if (!isColorWheelDrawn) {
        drawColorWheel()
      }
      drawSelectedColorBox()
    } else if (!isGameEnded) {
      background("white");
      
      rectMode(CENTER);
      fill(currentH, currentS, 100);
      rect(width/2, height/2, windowWidth, windowHeight);
      
      fill(0)
      textSize(24);
      textLeading(34)
      text("Now you are both trying to get close to your color", width/2, 20);
      text("It is good for you to be close to your color", width/2, 40);
      text("It is good for the other player to be close to their color as well", width/2, 60);
      text("Rotate the phone around together to try to find what you want", width/2, 80);
      text("Hit the SPACEBAR when you both agreed to a color!", width/2, 100);
    } else if (isGameEnded){
      background("white");
      textSize(48);
      textLeading(54)
      text("You were " + Math.floor(dist(myX,myY,usX,usY)) + " pixels away from your color", width/2, 50);
      text("How far away was your partner?", width/2, 70);
    }
}

function drawColorWheel() {
  background("white");
  for (let i = 0; i < allPix.length; i++) {
    for (let j = 0; j < allPix[i].length; j++) {
      stroke(allPix[i][j].hue,  allPix[i][j].sat, 100);
      point(i, j);
    }
  }

  fill('black');
  text("move around the color wheel with your mouse", width / 2, 30);
  text("click to select a color and send it to the server", width / 2, 50);
  isColorWheelDrawn = true;
}

function drawSelectedColorBox() {
  if (dist(width / 2, height / 2, mouseX, mouseY) < radius) {
    fill(allPix[mouseX][mouseY].hue, allPix[mouseX][mouseY].sat, 100);
    rect(0, 0, 50, 50);
  }
}

function mousePressed() {
  if (!isColorChosen) {
    if (dist(width/2,height/2,mouseX,mouseY) < radius) {
      myX = mouseX;
      myY = mouseY;
      let hue = allPix[mouseX][mouseY].hue;
      let sat = allPix[mouseX][mouseY].sat;
      isColorChosen = true;
      socket.emit('selected', {hue: hue, sat: sat});
      console.log('Color Selected', { hue: hue, sat: sat });
    }
  }
}

function keyPressed() {
  if (keyCode === SPACEBAR_KEYCODE) {
    isGameEnded = true;
  }
}

class Pix {
  
  constructor(hue,sat) {
    this.hue = hue;
    this.sat = sat;
  }
}