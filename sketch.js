var window_size_x = 600;
var window_size_y = 600;
var points = [];

class Point {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = random(0.2, 2);
    this.x_direction = random(-1, 1) > 0 ? 1 : -1;
    this.y_direction = random(-1, 1) > 0 ? 1 : -1;
  }

  show(color = 'white') {
    stroke(color);
    // strokeWeight(2);
    point(this.x, this.y);
  }
}

class Boundary {

  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  show(color = 'black') {
    stroke(color);
    strokeWeight(1);
    noFill();
    rect(this.x, this.y, Math.abs(this.x - this.w), Math.abs(this.y - this.h));
  }
}

class QuadTree {
  constructor(boundary, capacity, selectedBoundary) {
    this.boundary = boundary;
    this.capacity = capacity;

    this.selectedBoundary = null;
    if (selectedBoundary != null && this.checkBoundaryIntersection(boundary, selectedBoundary)) {
      this.selectedBoundary = selectedBoundary;
    }

    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;

    this.points = [];
  }

  checkBoundaryIntersection(b1, b2) {

    if (b1.x >= b2.w || b2.x >= b1.w || b1.y >= b2.h || b2.y >= b1.h) {
      return false;
    }

    return true;
  }

  checkPointIntersectionWithBoundary(x, y, boundary) {
    return (x >= boundary.x && x <= boundary.w && y >= boundary.y && y <= boundary.h);
  }

  insertPoint(point_index) {
    var b = this.boundary;

    if (b.x > points[point_index].x || b.w < points[point_index].x || b.y > points[point_index].y || b.h < points[point_index].y) {
      return false;
    }

    if (this.points.length < this.capacity && this.nw == null) {
      this.points.push(point_index);
      return true;
    } else {

      if (this.nw == null) {
        this.subdivide();
      }

      return this.nw.insertPoint(point_index) || this.ne.insertPoint(point_index) || this.sw.insertPoint(point_index) || this.se.insertPoint(point_index);
    }
    return false;
  }

  subdivide() {
    var b = this.boundary;
    var x = b.x;
    var y = b.y;
    var w = b.w;
    var h = b.h;
    var x_mid = (x + w) / 2;
    var y_mid = (y + h) / 2;

    var nw_boundary = new Boundary(x, y, x_mid, y_mid);
    var ne_boundary = new Boundary(x_mid, y, w, y_mid);
    var sw_boundary = new Boundary(x, y_mid, x_mid, h);
    var se_boundary = new Boundary(x_mid, y_mid, w, h);

    this.nw = new QuadTree(nw_boundary, this.capacity, this.selectedBoundary);
    this.ne = new QuadTree(ne_boundary, this.capacity, this.selectedBoundary);
    this.sw = new QuadTree(sw_boundary, this.capacity, this.selectedBoundary);
    this.se = new QuadTree(se_boundary, this.capacity, this.selectedBoundary);

    this.selectedBoundary = null;

    for (var i = 0; i < this.points.length; i++) {
      this.nw.insertPoint(this.points[i]) ||
        this.ne.insertPoint(this.points[i]) ||
        this.sw.insertPoint(this.points[i]) ||
        this.se.insertPoint(this.points[i]);
    }

    this.points = [];
  }

  showAndMovePoints() {
    if (this.points.length > 0) {
      for (var i = 0; i < this.points.length; i++) {
        var _point = points[this.points[i]];

        if (this.selectedBoundary == null) {
          _point.show('white');
        } else {
          if (this.checkPointIntersectionWithBoundary(_point.x, _point.y, this.selectedBoundary)) {
            _point.show('orange');
          } else {
            _point.show('white');
          }
        }

        var new_x = _point.x + (_point.velocity * _point.x_direction);
        var new_y = _point.y + (_point.velocity * _point.y_direction);

        if (new_x >= window_size_x || new_x <= 0) {
          _point.x_direction *= -1;
          new_x *= _point.x_direction;
        } else {
          _point.x = new_x;
        }

        if (new_y >= window_size_y || new_y <= 0) {
          _point.y_direction *= -1;
          new_y *= _point.y_direction;
        } else {
          _point.y = new_y;
        }

        points[this.points[i]] = _point;
      }
    } else if (this.nw != null) {
      this.nw.showAndMovePoints();
      this.ne.showAndMovePoints();
      this.sw.showAndMovePoints();
      this.se.showAndMovePoints();
    }
  }

  showBoundary() {
    this.boundary.show();

    if (this.nw != null) {
      this.nw.showBoundary();
      this.ne.showBoundary();
      this.sw.showBoundary();
      this.se.showBoundary();
    }
  }

}

var boundary;
var selected_boundary;

function setup() {
  createCanvas(600, 600);
  background(40);
  frameRate(40);


  slider = createSlider(2, 2000, 50, 5);
  slider.position(10, 50);
  slider.style('width', '80px');

  boundary = new Boundary(0, 0, window_size_x, window_size_y);
  selected_boundary = new Boundary(214, 73, window_size_x / 2.11, window_size_y / 1.67);

  for (var i = 0; i < 2000; i++) {
    points.push(new Point(Math.floor(random(0, window_size_x)), Math.floor(random(0, window_size_y))));
  }
}

function draw() {
  background(40);

  var qt = new QuadTree(boundary, 4, selected_boundary);

  qt.showBoundary();
  for (var i = 0; i < slider.value(); i++) {
    // qt.insertPoint(points[i]);
    qt.insertPoint(i);
  }

  qt.showBoundary();
  qt.showAndMovePoints();

  selected_boundary.show('green');

  noStroke();
  fill(255);
  text("framerate: " + Math.floor(frameRate()), 10, 20);
  text("particles count: " + slider.value(), 10, 40);

}