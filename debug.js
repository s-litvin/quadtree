console.info('Start');

// import { QuadTree } from './capacity_quadtree.js';
import { QuadTree } from './level_quadtree.js';

class Point {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

}

class DisplayObject {

  constructor(x, y) {
    this.position = new Point(x, y);
  }

}

const size = 100;
const tree = new QuadTree;
tree.initialize(size);

const count = 1000;
const objects = [];
const staticObjects = [];
const ratio = size / count;

let wx = 0;
let wy = 0;

for (let i = 0; i < count; i++) {
  const object = new DisplayObject(wx, wy);

  if (i % 3 == 0) {
    staticObjects.push(object);
    tree.insertStatic(object);
  } else {
    objects.push(object);
    tree.insert(object);
  }

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
    const distance = lengthTo(object.position, point);
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
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    tree.clear();
    for (const object of objects) {
      tree.insert(object);
    }
    for (const object of objects) {
      tree.findByRadius(object.position, radius);
    }
    time = Math.min(time, performance.now() - start);
  }
  console.info(time);
}
test();
