console.info('Start');

// import { QuadTree } from './capacity_quadtree.js';
import { QuadTree } from './level_quadtree.js';

class Point {

  constructor(x, y) {
    this.x = x;
    this.y = y;
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

const size = 1000;
const tree = new QuadTree;
tree.initialize(size);

const count = 1000;
const objects = [];
const ratio = size / count;

for (let i = 0; i < count; i++) {
  const point = new Point(
    Math.floor(ratio * i),
    Math.floor(ratio * i)
  );
  objects.push(point);
  tree.insert(point);
}

const point = new Point(50, 50);
const radius = 13;

function test() {
  const result = tree.findByRadius(point, radius);
  if (result.length == 0) {
    console.error(result);
  }

  for (const target of result) {
    target.__hit = true;
  }

  for (const object of objects) {
    const lengthTo = tree.lengthTo(object, point);
    const inner = lengthTo <= radius;
    const hit = object.__hit;
    if ((inner && !hit) || (!inner && hit)) {
      console.error('Failed', object, lengthTo, radius);
      console.groupEnd();
      return;
    }
  }
  console.info('Successful');

  let time = Infinity;
  for (let i = 0; i < 1000; i++) {
    const start = performance.now();
    tree.clear();
    for (const object of objects) {
      tree.insert(object);
    }
    for (const object of objects) {
      tree.findByRadius(object, radius);
    }
    time = Math.min(time, performance.now() - start);
  }
  console.info(time);
}
test();
