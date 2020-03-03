// Open and connect input socket
let socket = io('/output');

let choseColor = false;
let endGame = false;

// Listen for confirmation of connection
socket.on('connect', function () {
  console.log("Connected");
});

let r;
let allPix = [];

let currentH = 0;
let currentS = 0;

let myX = 0;
let myY = 0;

let usX = 0;
let usY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(15)
  if (width < height) {
      r = width/2;
  } else {
      r = height/2;
  }
  textAlign(CENTER);
  colorMode(HSB);
  
  translate(width/2, height/2);
  
  for (let x = 0; x < width; x++) {
    allPix[x] = []; 
    for (let y = 0; y < height; y++) {
      let p = createVector(x - width/2, y - height/2);
      let d = abs(dist(0,0,x-width/2,y-height/2));
      
      if (d < r) {
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
    if (!endGame) {
      usX = data.x * width;
      usY = data.y * height;
      currentH = allPix[usX][usY].hue;
      currentS = allPix[usX][usY].sat;
    }
  });
}

function draw() {
    console.log('draw');
  
    if (!choseColor) {
      background("white");
      for (let i = 0; i < allPix.length; i++) {
        for (let j = 0; j < allPix[i].length; j++) {
          stroke(allPix[i][j].hue, allPix[i][j].sat, 100);
          point(i, j);
        }
      }
      
      fill('black');
      text("move around the color wheel with your mouse", width/2, 30);
      text("click to select a color and send it to the server", width/2, 50);
      
      if (dist(width/2,height/2,mouseX,mouseY) < r) {
        fill(allPix[mouseX][mouseY].hue, allPix[mouseX][mouseY].sat, 100);
        rect(0,0,50,50);
      }
    }
    
    else if (!endGame) {
      background("white");
      
      rectMode(CENTER);
      fill(currentH, currentS, 100);
      rect(width/2, height/2, 100, 100);
      
      text("now you are both trying to get close to your color", width/2, 20);
      text("it is good for you to be close to your color", width/2, 40);
      text("it is good for the other player to be close to their color as well", width/2, 60);
      text("move around the invisible color wheel by rotating the phone together", width/2, 80);
      text("click again when you have chosen a spot", width/2, 100);
    }
    
    else {
      background("white");
      
      text("you were " + dist(myX,myY,usX,usY) + " pixels away from your color", width/2, 50);
      text("how far away was your partner?", width/2, 70);
    }
}

function mousePressed() {
  if (!choseColor) {
    if (dist(width/2,height/2,mouseX,mouseY) < r) {
      myX = mouseX;
      myY = mouseY;
      let hue = allPix[mouseX][mouseY].hue;
      let sat = allPix[mouseX][mouseY].sat;
      choseColor = true;
      socket.emit('selected', {hue: hue, sat: sat});
    }
  }
  
  else if (!endGame) {
    endGame = true;
  }
}

class Pix {
  
  constructor(hue,sat) {
    this.hue = hue;
    this.sat = sat;
  }
}