var bars = [];

var buttons = []; //load, save, strum, move, add, delete, print
var input;

var currentMode = "strum";
var currentBarIdx = -1;

//for dragged events
var prevX;
var prevY;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //initialise with random bars
  for(var i = 0; i<=9; i++) {
    bars.push(new Bar(int(random(0, 9)), 50 + (i*50), 100));
  }
  
  //creating buttons
  buttons.push(new Button("load it!", 50, height-50));
  input = createInput();
  input.position(50, height-20);
  buttons.push(new Button("save it!", 150, height-50));

  buttons.push(new Button("strum it!", 250, height-50));

  buttons.push(new Button("move it!", 350, height-50));
  buttons.push(new Button("add it!", 450, height-50));
  buttons.push(new Button("delete it!", 550, height-50));

  buttons.push(new Button("print it!", 650, height-50));
}

function draw() {
  //drawing constants (Title, mode)
  background(255);
  noStroke();
  textSize(24);
  fill(0);
  text("guiTARcode", 50, 50);

  textSize(12);
  fill(0);
  text("mode: " + currentMode, 50, 70);

  textSize(12);
  fill(0);
  text("name \nof file:", 10, height-20);

  textSize(12);
  fill(0);
  text("try preset1 | preset2 | preset3", 230, height-8);

  //barcode display
  for(var i = 0; i<bars.length; i++) {
    if(bars[i] == null) continue;
    bars[i].display();
  }

  //buttons
  for(var i = 0; i<buttons.length; i++) {
    buttons[i].display();
    buttons[i].isOn(mouseX, mouseY);
  }

  //draws coloured circle around mouse based on current mode
  if(currentMode == "move") {
    noStroke();
    fill(100,100,255);
    ellipse(mouseX, mouseY, 10);
  }
  else if(currentMode == "delete") {
    noStroke();
    fill(255,50,50);
    ellipse(mouseX, mouseY, 10);
  }
  else if(currentMode == "add") {
    textSize(32);
    fill(0);
    text("press any key 0-9", width/2, 70);

    noStroke();
    fill(50,255,50);
    ellipse(mouseX, mouseY, 10);
  }
   
  //for dragged events
  prevX = mouseX;
  prevY = mouseY;
}

function mouseMoved() {
  //strum when mouse over bar
  if(currentMode == "strum") {
    for(var i = 0; i<bars.length; i++) {
      if(bars[i] != null && bars[i].isOn(mouseX, mouseY)) {
        bars[i].play();
      }
    }
  }
}

function mouseClicked() {
  //button events (mostly changing current mode)
  if(buttons[0].on) loadTable('../assets/'+input.value()+'.csv','csv','header', loadPreset);
  else if(buttons[1].on) savePreset();
  else if(buttons[2].on) currentMode = "strum";
  else if(buttons[3].on) currentMode = "move";
  else if(buttons[4].on) currentMode = "add";
  else if(buttons[5].on) currentMode = "delete";
  else if(buttons[6].on) printNotation();

  //for deleting bars
  if(currentMode == "delete") {
    for(var i = 0; i<bars.length; i++) {
      if(bars[i] != null && bars[i].isOn(mouseX, mouseY)) {
        bars[i] = null;
        break;
      }
    }
  }
}

function mousePressed() {
  //selecting index of the bar to be moved
  if(currentMode == "move") {
    for(var i = 0; i<bars.length; i++) {
      if(bars[i] != null && bars[i].isOn(mouseX, mouseY)) {
        currentBarIdx = i;
        return;
      }
    }
    currentBarIdx = -1;
  }
}

function mouseReleased() {
  //resetting index of bar to be moved
  currentBarIdx = -1;
}

function mouseDragged() {
  //moving bar at currentBarIdx
  if(currentBarIdx != -1) {
    var xDist = mouseX - prevX; 
    var yDist = mouseY - prevY;
    bars[currentBarIdx].setPos(bars[currentBarIdx].x + xDist, bars[currentBarIdx].y + yDist);
  }
}

function keyTyped() {
  //for adding bars using number keys
  if(currentMode == "add") {
    if(!isNaN(key)) {
      bars.push(new Bar(int(key), mouseX, mouseY-150));
    } 
  }
  
}

function savePreset() {
  var table;
  table = new p5.Table();

  //create header
  table.addColumn('number');
  table.addColumn('x');
  table.addColumn('y');

  //add every bar to the table
  for(var i = 0; i<bars.length; i++) {
    if(bars[i] == null) continue;
    var newRow = table.addRow();
    newRow.setNum('number', bars[i].num);
    newRow.setNum('x', bars[i].x);
    newRow.setNum('y', bars[i].y);
  }
  
  //save file (defaults to downloads folder)
  if(input.value() != "") saveTable(table, input.value()+'.csv', 'csv'); 
  else saveTable(table, 'myBarcode.csv', 'csv'); 
}

function loadPreset(table) {
  var rows = table.getRows();
  var newBars = []; 

  //create bar objects from table
  for(var r = 0; r < rows.length; r++) {
    var number = int(rows[r].get('number'));
    var x = int(rows[r].get('x'));
    var y = int(rows[r].get('y'));

    newBars.push( new Bar(number, x, y));
  }
  //replace bars with array from file
  bars = newBars;
}

function printNotation() { //A very not elegant way of turning the bars into notation
  //printJS('Major Assignment A/Genius Theme.pdf'); 
  background(255);

  //staff lines
  stroke(0);
  strokeWeight(2);
  for(var i = 0; i<5; i++) {
    line(0, 200 + (i*20), width, 200 + (i*20));
  }

  var base = 300; //position of middle C

  for(var i = 0; i<bars.length; i++) {
    //note names
    textSize(12);
    fill(0);
    noStroke();
    text(bars[i].noteArray[bars[i].num], bars[i].x, 150);

    //note head
    fill(255, 0);
    stroke(0);
    strokeWeight(2);
    var y = base - (10*bars[i].num);
    if(bars[i].num >= 6) y -= 10;
    ellipse(bars[i].x, y, 20, 20);

    //ledger line for middle C
    if(bars[i].num == 0) {
      stroke(0);
      strokeWeight(2);
      line(bars[i].x-20, y, bars[i].x+20, y);
    }

    //sharp symbols 
    if(bars[i].noteArray[bars[i].num].includes("#")) {
      textSize(40);
      fill(0);
      noStroke();
      text("#", bars[i].x-35, y+15);
    }

    //treble clef?
  }
  window.print();
}

class Bar {
  constructor(number, xval, yval) {
    this.num = number; 
    this.freq = midiToFreq(60 + (number*2));
    this.noteArray = ['C4', 'D4', 'E4', 'F#4', 'G#4', 'A#5', 'C5', 'D5', 'E5', 'F#5'];

    this.x = xval; 
    this.y = yval;
    this.width = map(this.num, 0, 9, 20, 5);
    this.height = 300;

    this.vibrate = -1;

    this.stopTime = 0; //will continue to vibrate until millis() is more than this

    this.monoSynth = new p5.MonoSynth();
  }

  display() {
    if(millis() < this.stopTime) { //for bar vibrating
      stroke(0);
      strokeWeight(this.width);
      var timeLeft = map(this.stopTime-millis(), 1000, 0, 50, 0);
      var cpx = random(-timeLeft, timeLeft); //xval of control points of curve
      curve(this.x+cpx, this.y-50, this.x, this.y, this.x, this.y+this.height, this.x+cpx, this.y+50);
    } 
    else { //stationary bar
      stroke(0);
      strokeWeight(this.width);
      line(this.x, this.y, this.x, this.y+this.height);
    }

    //number display
    noStroke();
    textSize(12);
    fill(0);
    text(this.num, this.x, this.y+this.height+30);

    //covers rounded ends of lines
    fill(255);
    rect(this.x-(this.width/2), this.y-20, this.width, 20);
    rect(this.x-(this.width/2), this.y+this.height, this.width, this.width);
  }

  setPos(xval, yval) {
    this.x = xval; 
    this.y = yval;
  }

  play() {
    //play the note with the oscillator
    //this.env.play();
    this.stopTime = millis() + 1000;

    userStartAudio();

    var note = this.noteArray[this.num];
    var velocity = 0.5;
    var time = 0;
    var dur = 0.5;

    this.monoSynth.play(note, velocity, time, dur);
  }

  isOn(xval, yval) {
    if(xval > this.x - this.width/2 && xval < this.x + this.width/2) {
      if(yval > this.y && yval < this.y + this.height) {
        return true;
      }
    }
    return false;
  }
}

class Button {
  constructor(buttonText, xval, yval) {
    this.text = buttonText;
    this.x = xval; 
    this.y = yval; 

    this.width = 50; 
    this.height = 25;

    this.on = false;
  }

  display() {
    //background colour change
    if(this.on) fill(50);
    else fill(255);

    stroke(0); 
    strokeWeight(2);
    rect(this.x, this.y, this.width, this.height);

    //text colour change
    if(this.on) fill(255);
    else fill(0);

    noStroke();
    text(this.text, this.x+4, this.y+17);
  }

  isOn(xval, yval) {
    if(xval > this.x && xval < this.x + this.width) {
      if(yval > this.y && yval < this.y + this.height) {
        this.on = true;
        return;
      }
    }
    this.on = false;
  }
}