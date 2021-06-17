var prevX;
var prevY;

// stars
var xLights = [];
var yLights = [];
var numOfLights = 200;
var size = 2;
var mouseRad = 30;

// moon 
var moonX = 400;
var moonY = 200; 
var moonDiam = 80;
var onMoon = false;

// buildings 
var buildingHeights = [];
var buildingWidth = 50;
var maxHeight = 200;
var minHeight = 100;
var onBuildings = false;
var buildingsBW = 50;

// sounds
var fwLiftSound;
var fwExplodeSound;

var buildingsSound;
var starsSound;
var moonSound;

// firework
var fireworkX = -1; 
var fireworkY = -1;
var explodeX = -1;
var explodeY = -1;
var fireworkState = 0; // 0:off/exploding, 1:lifting
var fireworkSize = 5;
var fireworkColour; 
var fireworkRad = 0;
var fireworkMax = 120;
var fireworkAngles = [0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285,300,315,330,345];

function preload() {
  //loading sounds
  fwLiftSound = loadSound('assets/liftSound.wav');
  fwExplodeSound = loadSound('assets/explodeSound.wav');

  buildingsSound = loadSound('assets/MA1 buildings.wav');
  starsSound = loadSound('assets/MA1 stars.wav');
  moonSound = loadSound('assets/MA1 moon.wav');

  // playing 
  // buildingsSound.setVolume(0.05);
  // starsSound.setVolume(0.05);
  // moonSound.setVolume(0.05);
  moonSound.pan(-0.5);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0,0,20);
  noStroke();
  
  // lights
  for(var i = 0; i<numOfLights; i++) {
    xLights[i] = random(width);
    yLights[i] = random(height);

    fill(0);
    rect(xLights[i],yLights[i],size, size);
  }
  starSlider = createSlider(0, 100, 5);
  starSlider.position((width/2) - (starSlider.width/2) ,25); // x, y

  // buildings 
  for(var i = 0; i*buildingWidth<width; i++) {
    buildingHeights[i] = random(maxHeight-minHeight) + minHeight;
  }

  // playing sounds
  buildingsSound.play();  
  buildingsSound.loop();
  starsSound.play(); 
  starsSound.loop();
  moonSound.play(); 
  moonSound.loop();
}

function draw() {
  background(0,8);

  // lights
  for(var i = 0; i<numOfLights; i++) {
    fill(255, 8);
    ellipse(xLights[i],yLights[i],size, size);
  }
  starsSound.setVolume(starSlider.value()/100);

  // moon
  fill(255, 253, 208);
  ellipse(moonX, moonY, moonDiam); 
  moonSound.setVolume(moonDiam/500 * 1);

  // firework
   if(fireworkState == 1) {
    fill(fireworkColour);
    ellipse(fireworkX, fireworkY, fireworkSize);
  }
  else if(explodeX != -1 && explodeY != -1) { // there is an explode location
    var finished = true;

    fireworkRad = fireworkRad+1;
    if(fireworkRad < fireworkMax) finished = false;

    for(var i = 0; i<fireworkAngles.length; i++) {
      x = fireworkX + (fireworkRad * Math.cos(radians(fireworkAngles[i])));
      y = fireworkY + (fireworkRad * Math.sin(radians(fireworkAngles[i])));

      fill(fireworkColour);
      ellipse(x, y, fireworkSize);
    }
    
    if(finished || fireworkY < 0) {
      fireworkState = 0;
      fwLiftSound.stop();

      explodeX = -1;
      explodeY = -1;
    }
  }

  // buildings 
  for(var i = 0; i<buildingHeights.length; i++) {
    fill(30, 0, buildingsBW);
    rect(buildingWidth*i, height-buildingHeights[i], buildingWidth, buildingHeights[i]);
  }
  buildingsSound.setVolume(buildingsBW/300 * 1);
  
  // If mouse is held down
  if(mouseIsPressed) {
    mouseHeld();
  }

  // for dragged events
  prevX = mouseX;
  prevY = mouseY;
}

// for stars
function mouseMoved() {
  for(var i = 0; i<numOfLights; i++) {
    if(Math.abs(mouseX-xLights[i]) < mouseRad && Math.abs(mouseY-yLights[i]) < mouseRad) {
        fill(255);
        ellipse(xLights[i], yLights[i], size+1, size+1);
    }
  }
}

function mousePressed() {
  // on star slider
  if(mouseX > (width/2) - (starSlider.width/2) && mouseX < (width/2) + (starSlider.width/2)) {
    if(mouseY < 50) return;
  }

  // is on buildings
  for(var i = 0; i<buildingHeights.length; i++) {
    if(mouseX > i*buildingWidth && mouseX < i*buildingWidth + buildingWidth && mouseY > height-buildingHeights[i]) {
      onBuildings = true;
      return;
    }
  }

  // is on moon
  xDist = mouseX - moonX;
  yDist = mouseY - moonY;
  a2 = xDist*xDist; 
  b2 = yDist*yDist;
  c = Math.sqrt(a2 + b2);
  if(c <= moonDiam/2) {
    onMoon = true;
    return;
  }

  // launch firework
  if(fireworkState == 0) {
    fireworkX = mouseX;
    fireworkY = mouseY;   
    fireworkState = 1;
    
    //play sound
    fwLiftSound.play();
    fwLiftSound.pan(( (fireworkX/width)*2) - 1);

    fireworkColour = color(random(155)+100, random(155)+100, random(155)+100);
  }
}

// for controlling moon and buildings
function mouseDragged() {
  if(onMoon) {
    moonDiam += mouseY - prevY; 
  }
  else if(onBuildings) {
    buildingsBW -= mouseY - prevY;
    if(buildingsBW < 50) buildingsBW = 50;
    if(buildingsBW > 210) buildingsBW = 210;
  }

  prevX = mouseX;
  prevY = mouseY;
}

// for firework lift
function mouseHeld() {
  if(fireworkState == 1) {
    fireworkY -= 5;
  }
}  

// for firework explosion and releasing moon and buildings
function mouseReleased() {
  if(fireworkState == 1) {
    fireworkState = 0;
    
    fireworkRad = 0;

    // play explosion
    explodeX = fireworkX; 
    explodeY = fireworkY;

    fwLiftSound.stop();
    fwExplodeSound.pan(( (explodeX/width)*2) - 1);
    fwExplodeSound.play();
  }

  onMoon = false;
  onBuilings = false;
}