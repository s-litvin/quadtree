var window_size_x = 600;
var window_size_y = 600;

class Point {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = random(0.2, 2);
        this.x_direction = random(-1, 1) > 0 ? 1 : -1;
        this.y_direction = random(-1, 1) > 0 ? 1 : -1;
    }

    show() {
        stroke('grey');
        strokeWeight(2);
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

    show() {
        stroke('black');
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

    insertPoint(point) {
        var b = this.boundary;
        if (b.x > point.x || b.w < point.x || b.y > point.y || b.h < point.y) {
            return false;
        }

        if (this.points.length < this.capacity && this.nw == null) {
            this.points.push(point);
            return true;
        } else {

            if (this.nw == null) {
                this.subdivide();
            }

            return this.nw.insertPoint(point) || this.ne.insertPoint(point) || this.sw.insertPoint(point) || this.se.insertPoint(point);
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

    showAndMovePoints() {
        if (this.points.length > 0) {
            for (var i = 0; i < this.points.length; i++) {
                var _point = this.points[i];

                _point.show();

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

                this.points[i] = _point;
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

var points = [];

function setup() {
    createCanvas(600, 600);
    background(40);
    frameRate(40);

    for (var i = 0; i < 851; i++) {
        points.push(new Point(Math.floor(random(0, window_size_x)), Math.floor(random(0, window_size_y))));
    }
}

function draw() {
    background(40);

    var boundary = new Boundary(0, 0, window_size_x, window_size_y);
    var qt = new QuadTree(boundary, 4);

    for (var i = 0; i < points.length; i++) {
        qt.insertPoint(points[i]);
    }

    qt.showBoundary();
    qt.showAndMovePoints();

}
