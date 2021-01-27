var window_size = 600;
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
    var f = p5.Vector.div(forceVector, this.mass);
    this.acceleration.add(f);
  }

  move() {
    this.applyForce(gravity);

    this.position.add(this.velocity.add(this.acceleration));

    if (this.position.x >= window_size - 3 || this.position.x <= 3) {
      this.velocity.x *= -1;
    }
    if (this.position.y >= window_size - 3 || this.position.y <= 3) {
      this.velocity.y *= -1;
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

class Boundary {

  constructor(x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = w;
    this.y2 = h;
  }

  show(color = 'black') {
    stroke(color);
    strokeWeight(1);
    noFill();
    rect(this.x1, this.y1, Math.abs(this.x1 - this.x2), Math.abs(this.y1 - this.y2));
  }
}

class QuadTree {

  initialize(size, capacity = 120) {
    const bound = new Boundary(0, 0, size, size);
    this._initialize(bound, capacity);
  }

  _initialize(bound, capacity) {
    this.boundary = bound;
    this.capacity = capacity;

    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;

    this.points = [];
    return this;
  }

  insert(object) {
    var b = this.boundary;

    if (b.x1 > object.position.x ||
      b.x2 < object.position.x ||
      b.y1 > object.position.y ||
      b.y2 < object.position.y) {
      return false;
    }

    if (b.x2 - b.x1 < 8  ||
      (this.points.length < this.capacity && this.nw == null)
    ) {
      this.points.push(object);
      object.modified = false;
      return true;
    } else {
      if (this.nw == null) {
        this.subdivide();
      }

      return this.nw.insert(object) ||
        this.ne.insert(object) ||
        this.sw.insert(object) ||
        this.se.insert(object);
    }

    return false;
  }

  subdivide() {
    var x = this.boundary.x1;
    var y = this.boundary.y1;
    var w = this.boundary.x2;
    var h = this.boundary.y2;
    var x_mid = (x + w) / 2;
    var y_mid = (y + h) / 2;

    var nw_boundary = new Boundary(x, y, x_mid, y_mid);
    var ne_boundary = new Boundary(x_mid, y, w, y_mid);
    var sw_boundary = new Boundary(x, y_mid, x_mid, h);
    var se_boundary = new Boundary(x_mid, y_mid, w, h);

    this.nw = new QuadTree()._initialize(nw_boundary, this.capacity);
    this.ne = new QuadTree()._initialize(ne_boundary, this.capacity);
    this.sw = new QuadTree()._initialize(sw_boundary, this.capacity);
    this.se = new QuadTree()._initialize(se_boundary, this.capacity);

    for (var i = 0; i < this.points.length; i++) {
      this.nw.insert(this.points[i]) ||
        this.ne.insert(this.points[i]) ||
        this.sw.insert(this.points[i]) ||
        this.se.insert(this.points[i]);
    }

    this.points = [];
  }

  showBoundary() {
    if (this.nw != null) {
      this.nw.showBoundary();
      this.ne.showBoundary();
      this.sw.showBoundary();
      this.se.showBoundary();
    } else {
      this.boundary.show();
    }
  }

  findByRadius(point, radius) {
    return this._findByRadius(point, radius);
  }

  _findByRadius(point, radius) {
    if (this.nw != null) {
      return [
        ...this.nw._findByRadius(point, radius),
        ...this.ne._findByRadius(point, radius),
        ...this.sw._findByRadius(point, radius),
        ...this.se._findByRadius(point, radius)
      ];
    } else {
      if (this._checkIntersectionWithCircle(point, radius, this.boundary)) {
        var return_array = [];
        for (var i = 0; i < this.points.length; i++) {
          if (this.lengthTo(this.points[i].position, point) <= radius) {
            return_array.push(this.points[i]);
          }
        }
        return return_array;
      } else {
        return [];
      }
    }
  }

  _checkIntersectionWithCircle(point, radius, boundary) {
    if (boundary.x2 < point.x - radius ||
      boundary.x1 > point.x + radius ||
      boundary.y1 > point.y + radius ||
      boundary.y2 < point.y - radius
    ) {
      return false;
    }

    return true;
  }

  lengthTo(
    point1,
    point2
  ) {
    const qX = (point1.x - point2.x) ** 2;
    const qY = (point1.y - point2.y) ** 2;
    return Math.sqrt(qX + qY);
  }

  clear() {
    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;

    this.points = [];
  }

}

var selected_boundary;
var objects = [];
var tree;

function setup() {
  createCanvas(600, 600);
  background(40);
  frameRate(40);

  gravity = createVector(0, 0.0002)

  slider = createSlider(2, 2000, 100, 5);
  slider.position(10, 50);
  slider.style('width', '80px');

  sliderCapacity = createSlider(1, 250, 8, 1);
  sliderCapacity.position(10, 80);
  sliderCapacity.style('width', '80px');

  for (var i = 0; i < 2000; i++) {
    objects.push(new DisplayObject(Math.floor(random(0, window_size)), Math.floor(random(0, window_size))));
  }

  tree = new QuadTree;
  const capacity = sliderCapacity.value();
  tree.initialize(window_size, capacity);
}

function draw() {
  background(40);

  tree.clear();

  for (var i = 0; i < slider.value(); i++) {
    tree.insert(objects[i]);
  }

  tree.showBoundary();
  showAndMovePoints();

  // frameRate(0);
  noStroke();
  fill(255);
  text("framerate: " + Math.floor(frameRate()), 10, 20);
  text("particles count: " + slider.value(), 10, 40);
  text("tree capacity: " + sliderCapacity.value(), 10, 80);
}

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

          pointsSelected[j].position.add(v2.mult(-1));

          let v3 = p5.Vector.add(v1.mult(-1), v2.mult(-1));
          let v4 = p5.Vector.add(v1.mult(-1), v2.mult(-1));

          _object.velocity.add(v3);
          pointsSelected[j].velocity.add(v4);

          pointsSelected[j].modified = true;
          _object.modified = true;
        }
      }

      _object.show('orange');
    } else {
      _object.show('white');
    }

    _object.move();
  }

}
