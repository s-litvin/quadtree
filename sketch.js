// import { QuadTree } from './capacity_quadtree.js';
import { QuadTree } from './level_quadtree.js';

var window_size_x = window.innerWidth;
var window_size_y = window.innerHeight;
var points_count_limit = 2000;
var gravity;

class DisplayObject {

  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-2, 2), random(-2, 2));
    this.acceleration = createVector(0, 0);
    this.mass = random(3, 13);
    this.modified = false;
  }

  applyForce(forceVector) {
    var force = p5.Vector.div(forceVector, this.mass);
    this.acceleration.add(force);
  }

  move() {
    this.applyForce(gravity);

    const velocity = this.velocity.add(this.acceleration);
    this.position.add(velocity);

    if (this.position.x >= window_size_x) {
      this.velocity.x *= -1;
      this.position.x = window_size_x - 1;
    } else
    if (this.position.x <= 0) {
      this.velocity.x *= -1;
      this.position.x = 0;
    }

    if (this.position.y >= window_size_y) {
      this.velocity.y *= -1;
      this.position.y = window_size_y - 1;
    }
    if (this.position.y <= 0) {
      this.velocity.y *= -1;
      this.position.y = 0;
    }

    var speed = this.velocity.mag();
    if (speed >= 2) {
      this.velocity.normalize();
      this.velocity.mult(4);
    }
  }

  show(color = 'white') {
    stroke(color);
    strokeWeight(this.mass);
    point(this.position.x, this.position.y);
  }
}

var selected_boundary;
var objects = [];
var tree;
var slider;
var sliderCapacity;
var checkboxTree;

function setup() {
  createCanvas(window_size_x, window_size_y);
  background(40);
  frameRate(40);

  gravity = createVector(0, 0.0002)

  slider = createSlider(2, 2000, 100, 5);
  slider.position(10, 50);
  slider.style('width', '80px');

  sliderCapacity = createSlider(1, 250, 8, 1);
  sliderCapacity.position(10, 80);
  sliderCapacity.style('width', '80px');

  checkboxTree = createCheckbox('show tree', false);
  checkboxTree.position(10, 110);
  checkboxTree.style('color', 'white');

  for (var i = 0; i < 2000; i++) {
    const x = Math.floor(random(0, window_size_x));
    const y = Math.floor(random(0, window_size_y));
    objects.push(new DisplayObject(x, y));
  }

  tree = new QuadTree;
  const capacity = sliderCapacity.value();
  tree.initialize(Math.max(window_size_x, window_size_y), capacity);
}
window.setup = setup;

function draw() {
  background(40);

  tree.clear();

  for (var i = 0; i < slider.value(); i++) {
    objects[i].modified = false;
    tree.insert(objects[i]);
  }

  checkboxTree.checked() && tree.showBoundary();
  showAndMovePoints();

  // frameRate(0);
  noStroke();
  fill(255);
  text("framerate: " + Math.floor(frameRate()), 10, 20);
  text("particles count: " + slider.value(), 10, 40);
  text("tree capacity: " + sliderCapacity.value(), 10, 80);
}
window.draw = draw;

function showAndMovePoints() {
  for (var i = 0; i < slider.value(); i++) {
    var _object = objects[i];
    var pointsSelected = tree.findByRadius(_object.position, _object.mass);

    var _intersected_points_count = pointsSelected.length;
    if (_intersected_points_count > 1) {
      for (var j = 0; j < _intersected_points_count; j++) {
        if (pointsSelected[j] != _object &&
          pointsSelected[j].modified == false
        ) {
          var v1 = _object.velocity;
          var v2 = pointsSelected[j].velocity;
          let v3 = p5.Vector.add(v1.mult(-1), v2.mult(-1));
          let v4 = p5.Vector.add(v1.mult(-1), v2.mult(-1));

          _object.velocity.add(v3);
          pointsSelected[j].velocity.add(v4);

          pointsSelected[j].modified = true;
          _object.modified = true;
        }
      }

      _object.move();
      _object.show('orange');
    } else {
      _object.move();
      _object.show('white');
    }
  }

}
