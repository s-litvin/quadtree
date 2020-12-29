var window_size_x = 100;
var window_size_y = 100;

var points_count_limit = 20000;
var found_points = [];
var points = [];
var qt_capacity = 120; // 40 for 10000, 120 for 20000, 

class Point {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  show(pointsSelected) {

    let _points_full = [];
    for (let i = 0; i < pointsSelected.length; i++) {
      if (points[pointsSelected[i]].x != this.x && points[pointsSelected[i]].y != this.y) {
        _points_full.push([points[pointsSelected[i]].x, points[pointsSelected[i]].y]);
      }
    }

    if (_points_full.length > 0) {
      found_points.push({
        'point': [this.x, this.y],
        'neighbours': _points_full
      });
    }

  }
}

class Boundary {

  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
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

console.log(`%c ${new Date().toJSON()} -> --start`, 'color: #bada55');

boundary = new Boundary(0, 0, window_size_x, window_size_y);

for (var i = 0; i < points_count_limit; i++) {
  points.push(new Point(Math.floor(Math.random() * window_size_x), Math.floor(Math.random() * window_size_y)));
}


var qt = new QuadTree(boundary, qt_capacity);

for (var i = 0; i < points_count_limit; i++) {
  qt.insertPoint(i);
}

showAndMovePoints(qt);

console.log(`%c ${new Date().toJSON()} -> --end`, 'color: #bada55');


function showAndMovePoints(qt) {

  var _old_points = points;

  for (var i = 0; i < points_count_limit; i++) {

    var _point = points[i];
    var pointsSelected = qt.selectPointsForCircleArea(_point.x, _point.y, 5);

    var _intersected_points_count = pointsSelected.length;
    if (_intersected_points_count > 1) {
      _point.show(pointsSelected);
    }
  }

  console.log(JSON.stringify(found_points));

}
