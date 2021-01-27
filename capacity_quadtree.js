import { Boundary } from './boundary.js';

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
    var b = this.boundary;
    var x = b.x1;
    var y = b.y1;
    var w = b.x2;
    var h = b.y2;
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

  findByRadius(point, radius) {
    if (this.nw != null) {
      return [
        ...this.nw.findByRadius(point, radius),
        ...this.ne.findByRadius(point, radius),
        ...this.sw.findByRadius(point, radius),
        ...this.se.findByRadius(point, radius)
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

}

export {
  QuadTree
};
