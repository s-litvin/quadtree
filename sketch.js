var window_size_x = 600;
var window_size_y = 600;
var points = [];

class Point {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = random(0.2, 2);
    this.x_direction = Math.random() > 0.5 ? -1 : 1;
    this.y_direction = Math.random() > 0.5 ? -1 : 1;
  }

  show(color = 'white') {
    stroke(color);
    strokeWeight(4);
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
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;

    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;

    this.points = [];
  }

  insertPoint(point_index) {
    var b = this.boundary;

    if (b.x > points[point_index].x || 
        b.w < points[point_index].x || 
        b.y > points[point_index].y || 
        b.h < points[point_index].y) {
      return false;
    }

    if (this.points.length < this.capacity && this.nw == null) {
      this.points.push(point_index);
      return true;
    } else {

      if (this.nw == null) {
        this.subdivide();
      }

      return this.nw.insertPoint(point_index) || 
        this.ne.insertPoint(point_index) || 
        this.sw.insertPoint(point_index) || 
        this.se.insertPoint(point_index);
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

    this.nw = new QuadTree(nw_boundary, this.capacity);
    this.ne = new QuadTree(ne_boundary, this.capacity);
    this.sw = new QuadTree(sw_boundary, this.capacity);
    this.se = new QuadTree(se_boundary, this.capacity);

    for (var i = 0; i < this.points.length; i++) {
      this.nw.insertPoint(this.points[i]) ||
        this.ne.insertPoint(this.points[i]) ||
        this.sw.insertPoint(this.points[i]) ||
        this.se.insertPoint(this.points[i]);
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
  
  selectPointsForCircleArea(x, y, radius) {
    
    if (this.nw != null) {
      return this.nw.selectPointsForCircleArea(x, y, radius).concat(
        this.ne.selectPointsForCircleArea(x, y, radius),
        this.sw.selectPointsForCircleArea(x, y, radius),
        this.se.selectPointsForCircleArea(x, y, radius)
      );
    } else {
      if (this.checkIntersectionWithCircle(x, y, radius, this.boundary)) {    
        var return_array = [];
        for (var i = 0; i < this.points.length; i++) {
          if (Math.sqrt(Math.pow(points[this.points[i]].x - x, 2) + Math.pow(points[this.points[i]].y - y, 2)) <= radius) {
            return_array.push(this.points[i]);
          }
        }
        return return_array;   
      } else {
        return [];
      }
    }
  }
  
  checkIntersectionWithCircle(x, y, radius, boundary) {
    if (boundary.w < x - radius || boundary.x > x + radius || boundary.y > y + radius || boundary.h < y - radius) {
      return false;
    }

    return true;
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

  for (var i = 0; i < 2000; i++) {
    points.push(new Point(Math.floor(random(0, window_size_x)), Math.floor(random(0, window_size_y))));
  }
}

function draw() {
  background(40);

  var qt = new QuadTree(boundary, 4);

  qt.showBoundary();
  for (var i = 0; i < slider.value(); i++) {
    qt.insertPoint(i);
  }

  qt.showBoundary();
  showAndMovePoints(qt);
  
  // frameRate(0);
  noStroke();
  fill(255);
  text("framerate: " + Math.floor(frameRate()), 10, 20);
  text("particles count: " + slider.value(), 10, 40);
}

  function showAndMovePoints(qt) {
    
    var _old_points = points;
  
      for (var i = 0; i < slider.value(); i++) {
        
        var _point = points[i];
        var pointsSelected = qt.selectPointsForCircleArea(_point.x, _point.y, 4);
        
        if (pointsSelected.length > 1) {
          _point.show('orange');
          _point.x_direction = Math.random() > 0.5 ? -1: 1;
          _point.y_direction = Math.random() > 0.5 ? -1: 1;
          _point.x += Math.random() * 1.3;
          _point.y += Math.random() * 1.3;
        } else {
          _point.show('white');
        }
        
        var _point = points[i];

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

        points[i] = _point;
      }

  }