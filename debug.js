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

const size = 100;
const tree = new QuadTree;
tree.initialize(size);

const count = 1000;
const objects = [];
const ratio = size / count;

let wx = 0;
let wy = 0;

for (let i = 0; i < count; i++) {
  const point = new Point(wx, wy);
  objects.push(point);
  tree.insert(point);

  wx = wx < size ? wx + 1 : 0;
  wy = wy < size ? wy + 1 : 0;
}

const radius = 13;
const point = new Point(radius, radius);

function lengthTo(
  point1, //: Point,
  point2 //: Point
) { //: number
  const qX = (point1.x - point2.x) ** 2;
  const qY = (point1.y - point2.y) ** 2;
  return Math.sqrt(qX + qY);
}

function test() {
  const result = tree.findByRadius(point, radius);
  if (result.length == 0) {
    console.error({ point, radius });
  }

  for (const target of result) {
    target.__hit = true;
  }

  for (const object of objects) {
    const distance = lengthTo(object, point);
    const inner = distance <= radius;
    const hit = object.__hit;
    if ((inner && !hit) || (!inner && hit)) {
      console.error('Failed', { object, distance, radius });
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
