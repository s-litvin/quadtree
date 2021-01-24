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
const total_cycles = 1;
const boundary = new Boundary(0, 0, window_size_x, window_size_y);

let timeAccumulator = 0;
let points = [];

for (let cycle = 0; cycle < total_cycles; cycle++) {
	let startTimer = performance.now();

	const tree = new QuadTree(boundary);
	points = [];
	
	wx = 0;
	wy = 0;
	for (let i = 0; i < points_count_limit; i++) {
	
	  const point = new Point(wx, wy);
	  
	  points.push(point);
	  tree.insert(point);
	  
		if (wx < window_size_x) {
			wx++;
		} else {
			wx = 0;
		}
		
		if (wy < window_size_y) {
			wy++;
		} else {
			wy = 0;
		}
	}

	for (let i = 0; i < points_count_limit; i++) {
	  const pointsSelected = tree.findByRadius(points[i], 5);

	  if (pointsSelected.length > 1) {
		points[i].show(pointsSelected);
	  }
	}

	let stopTimer = performance.now();
	timeAvg += stopTimer - startTimer;
}

console.log('Cycle time (ms): ', timeAccumulator / total_cycles);
console.log(points);
console.log(found_points);
