class Boundary {

  constructor(x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = w;
    this.y2 = h;
  }

  show(color = 'black') {
    stroke(color);
    strokeWeight(1);
    noFill();
    rect(this.x1, this.y1, Math.abs(this.x1 - this.x2), Math.abs(this.y1 - this.y2));
  }

}

export {
  Boundary
};
