// import { QuadTree } from './capacity_quadtree.js';
import { QuadTree } from './level_quadtree.js';

var found_points = [];

class Point {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  show(pointsSelected) {

    let _points_full = [];
    for (let i = 0; i < pointsSelected.length; i++) {
      if (pointsSelected[i].x != this.x && pointsSelected[i].y != this.y) {
        _points_full.push([pointsSelected[i].x, pointsSelected[i].y]);
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
    this.x1 = x;
    this.y1 = y;
    this.x2 = w;
    this.y2 = h;
  }

}

const window_size_x = 100;
const window_size_y = 100;

const points_count_limit = 20000;

const boundary = new Boundary(0, 0, window_size_x, window_size_y);

const tree = new QuadTree(boundary);
const points = [];

for (let i = 0; i < points_count_limit; i++) {
  const point = new Point(
    Math.floor(Math.random() * window_size_x),
    Math.floor(Math.random() * window_size_y)
  );
  points.push(point);
  tree.insert(point);
}

for (let i = 0; i < points_count_limit; i++) {
  const pointsSelected = tree.findByRadius(points[i], 5);

  if (pointsSelected.length > 1) {
    points[i].show(pointsSelected);
  }
}

console.log(performance.now(), '-> --end');
console.log(found_points);
