
var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Composites = Matter.Composites;
var keys = [];
var Events = Matter.Events;
var frame = 0;
var seconds = 0;



var engine;
var world;
var circle1;
var bottom_boundary;
var upper_boundary;
var left_boundary;
var right_boundary;


function setup(){
  //createCanvas(400, 400);
  createCanvas(1200,1200); //still need to decide on default size
  engine = Engine.create();
  engine.world.gravity.y = 0;
  world = engine.world;
  // bottom = new Boundary(200, 380, width, 50, 0); // position is calculated from center of object
  bottom_boundary = new Boundary(width/2, height, width, 50, 0);
  upper_boundary = new Boundary(width/2, 0, width, 50, 0);
  left_boundary = new Boundary(0, height/2, 50, height, 0);
  right_boundary = new Boundary(width, height/2, 50, height, 0);
  circle1 = new Circle(200, 100, 20);
}

function incrementSeconds(){
    seconds += 1;
    // console.log(seconds);
    if (seconds > 0){
    // document.getElementById('info').innerHTML = "Frame: " + frame;
  }
}

setInterval(incrementSeconds, 1000);

function draw(){
  background(50);
  Engine.update(engine);
  bottom_boundary.show();
  upper_boundary.show();
  left_boundary.show();
  right_boundary.show();

  circle1.show();

  // Events.on(engine, "collisionStart", function(event) {
  //   var pairs = event.pairs
  //  for (var i = 0, j = pairs.length; i != j; ++i) {
  //      var pair = pairs[i];
  //    if (pair.bodyA.id === circle1.body.id) {
  //       circle1.body.bottom = true;
  //    } else if (pair.bodyB.id === circle1.body.id) {
  //       circle1.body.bottom = true;
  //    }
  //  }
  //  });

  Events.on(engine, "collisionActive", function(event) {      // only lets you jump if you're on bottom
    var pairs = event.pairs
    for (var i = 0, j = pairs.length; i != j; ++i) {
      var pair = pairs[i];
      if (pair.bodyA.id === circle1.body.id) {
         circle1.body.bottom = true;
      } else if (pair.bodyB.id === circle1.body.id) {
       circle1.body.bottom = true;
      }
    }
  });

  var maxVelocity = 1;



  // have to stop so much horizontal acceleration from happening when in the middle of a jump

  document.body.addEventListener("keydown", function(e) {
      keys[e.keyCode] = true;
      if (keys[87] || keys[38]) {                                   // if 'w' or up is pressed
        Body.setVelocity(circle1.body, {x:circle1.body.velocity.x, y:-5});
      }   
      if (keys[83] || keys[40]) {                                   // if 's' or down is pressed
        Body.setVelocity(circle1.body, {x:circle1.body.velocity.x, y:5});
      }  
      if (keys[65] || keys[37]) {                                   // if 'a' or left is pressed
        Body.setVelocity(circle1.body, {x:-5, y:circle1.body.velocity.y});
      }
      if (keys[68] || keys[39]) {                                   // if 'd' or right is pressed
        Body.setVelocity(circle1.body, {x:5, y:circle1.body.velocity.y});
      }
  });

  document.body.addEventListener("keyup", function(e) {
      if (keys[87] || keys[38] || keys[83] || keys[40] || keys[65] || keys[37] || keys[68] || keys[39]) {                                   // if 'w' or up is pressed
        Body.setVelocity(circle1.body, {x:0, y:0});
      }   
       keys[e.keyCode] = false;
  });

    window.onmousedown = function(e) {
      console.log(circle1.body);

    }

    window.onmousemove = function(e) {
      console.log("hi");
    }

    document.body.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });
    // engine.world.gravity.y = 0;
    frame ++;
}

if ('geolocation' in navigator) {
  console.log('geolocation available');
  navigator.geolocation.getCurrentPosition(async position => {
    try{
      const api_url = '/weather';
      const response = await fetch(api_url);
      const json = await response.json();
      console.log('json' + json);
    }
    catch (error) {
      console.error(error);
    }
  });
}
/*     Jump key code
if (keys[83] || keys[40]) {
  if (circle1.body.velocity.y < maxVelocity){
    circle1.body.force = { x: 0, y: 0.01 };  // jump
  }
  else {
    circle1.body.velocity.y = 1;
  }
}
*/