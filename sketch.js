let window_size_x = 600;
let window_size_y = 600;

let points = [];

let gravity;

class Point {

  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-2, 2), random(-2, 2));
    this.acceleration = createVector(0, 0);
    this.mass = random(3, 13);
    this.modified = false;
  }

  applyForce(forceVector) {
    let f = p5.Vector.div(forceVector, this.mass);
    this.acceleration.add(f);
  }

  move() {
  
    this.applyForce(gravity);
    
    this.position.add(this.velocity.add(this.acceleration));

    if (this.position.x >= window_size_x - this.mass) {
      this.position.x = window_size_x - this.mass
      this.velocity.x *= -1;
    } else if (this.position.x <= this.mass) {
      this.position.x = this.mass
      this.velocity.x *= -1;
    } else if (this.position.y >= window_size_y - this.mass) {
      this.position.y = window_size_y - this.mass;
      this.velocity.y *= -1;
    } else if (this.position.y <= this.mass) {
      this.position.y = this.mass;
      this.velocity.y *= -1;
    }
    
    let speed = this.velocity.mag();
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
    let b = this.boundary;

    if (b.x > points[point_index].position.x ||
      b.w < points[point_index].position.x ||
      b.y > points[point_index].position.y ||
      b.h < points[point_index].position.y) {
      return false;
    }

    if (b.x2 - b.x1 < 10  || (this.points.length < this.capacity && this.nw == null)) {
      this.points.push(point_index);
      points[point_index].modified = false;
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
    let b = this.boundary;
    let x = b.x;
    let y = b.y;
    let w = b.w;
    let h = b.h;
    let x_mid = (x + w) / 2;
    let y_mid = (y + h) / 2;

    let nw_boundary = new Boundary(x, y, x_mid, y_mid);
    let ne_boundary = new Boundary(x_mid, y, w, y_mid);
    let sw_boundary = new Boundary(x, y_mid, x_mid, h);
    let se_boundary = new Boundary(x_mid, y_mid, w, h);

    this.nw = new QuadTree(nw_boundary, this.capacity);
    this.ne = new QuadTree(ne_boundary, this.capacity);
    this.sw = new QuadTree(sw_boundary, this.capacity);
    this.se = new QuadTree(se_boundary, this.capacity);

    for (let i = 0; i < this.points.length; i++) {
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
        let return_array = [];
        for (let i = 0; i < this.points.length; i++) {
          if (Math.sqrt(Math.pow(points[this.points[i]].position.x - x, 2) + Math.pow(points[this.points[i]].position.y - y, 2)) <= radius) {
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

let boundary;
let selected_boundary;

function setup() {
  createCanvas(600, 600);
  background(40);
  frameRate(40);
  
  gravity = createVector(0, 0.0002)

  slider = createSlider(2, 8000, 100, 5);
  slider.position(10, 50);
  slider.style('width', '80px');

  sliderCapacity = createSlider(1, 200, 8, 1);
  sliderCapacity.position(10, 80);
  sliderCapacity.style('width', '80px');

  boundary = new Boundary(0, 0, window_size_x, window_size_y);

  for (let i = 0; i < 8000; i++) {
    points.push(new Point(Math.floor(random(0, window_size_x)), Math.floor(random(0, window_size_y))));
  }
}

function draw() {
  background(40);

  let qt = new QuadTree(boundary, sliderCapacity.value());

  qt.showBoundary();
  for (let i = 0; i < slider.value(); i++) {
    qt.insertPoint(i);
  }

  qt.showBoundary();
  showAndMovePoints(qt);

  // frameRate(0);
  noStroke();
  fill(255);
  text("framerate: " + Math.floor(frameRate()), 10, 20);
  text("particles count: " + slider.value(), 10, 40);
  text("tree capacity: " + sliderCapacity.value(), 10, 80);
}

function showAndMovePoints(qt) {

  let _old_points = points;

  for (let i = 0; i < slider.value(); i++) {

    let _point = points[i];
    let pointsSelected = qt.selectPointsForCircleArea(_point.position.x, _point.position.y, _point.mass  );

    let _intersected_points_count = pointsSelected.length;
    if (_intersected_points_count > 1) {
      for (let j = 0; j < _intersected_points_count; j++) {
        if (points[pointsSelected[j]] != _point && points[pointsSelected[j]].modified == false) {
          
          let v1 = _point.velocity;
          let v2 = points[pointsSelected[j]].velocity;
          
          
          points[pointsSelected[j]].position.add(v2.mult(-1));

          let v3 = p5.Vector.add(v1.mult(-1), v2.mult(-1));
          let v4 = p5.Vector.add(v1.mult(-1), v2.mult(-1));

          _point.velocity.add(v3);
          points[pointsSelected[j]].velocity.add(v4);
          
          points[pointsSelected[j]].modified = true;
          _point.modified = true;
        }
      }
      
      _point.show('orange');
      
      
    } else {
      _point.show('white');
    }

    _point.move();

    points[i] = _point;
  }

}
