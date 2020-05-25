class Point 
{
  
  constructor(x, y) 
  {
    this.x = x;
    this.y = y;
  }
  
  show()
  {
    stroke('grey'); // Change the color
    strokeWeight(2); // Make the points 10 pixels in size
    point(this.x, this.y);
  }
}

class Boundary 
{
  
  constructor(x, y, w, h) 
  {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  show()
  {
    stroke('black');
    strokeWeight(1);
    noFill();
    rect(this.x, this.y, Math.abs(this.x-this.w), Math.abs(this.y - this.h));
  }
}

class QuadTree 
{
  constructor(boundary, capacity) 
  {
    this.boundary = boundary;
    this.capacity = capacity;
    
    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;
    
    this.points = [];
  }
  
  insertPoint(point) 
  {
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
  
  subdivide()
  {
    var b = this.boundary;
    var x = b.x;
    var y = b.y;
    var w = b.w;
    var h = b.h;
    var x_mid = (x + w)/2;
    var y_mid = (y + h)/2;
    
    var nw_boundary = new Boundary(x, y, x_mid, y_mid);
    var ne_boundary = new Boundary(x_mid, y, w, y_mid);
    var sw_boundary = new Boundary(x, y_mid, x_mid, h);
    var se_boundary = new Boundary(x_mid, y_mid, w, h);
    
    this.nw = new QuadTree(nw_boundary, 4);
    this.ne = new QuadTree(ne_boundary, 4);
    this.sw = new QuadTree(sw_boundary, 4);
    this.se = new QuadTree(se_boundary, 4);
    
    for (var i = 0; i < this.points.length; i++) {
      if (!this.nw.insertPoint(this.points[i])) {
        if (!this.ne.insertPoint(this.points[i])) {
          if (!this.sw.insertPoint(this.points[i])) {
            this.se.insertPoint(this.points[i])
          }
        }
      }
    }
      
    this.points = [];
  }
  
  showPoints()
  {
    if (this.points.length > 0) { 
        for (var i = 0; i < this.points.length; i++) {
          this.points[i].show();
        }  
    } else if (this.nw != null) {
      this.nw.showPoints();
      this.ne.showPoints();
      this.sw.showPoints();
      this.se.showPoints();
    }
  }
  
  showBoundary()
  {
    this.boundary.show();
    
    if (this.nw != null) {
      this.nw.showBoundary();
      this.ne.showBoundary();
      this.sw.showBoundary();
      this.se.showBoundary();
    }
  }
}

function setup() 
{
  createCanvas(600, 600);
  background(40);
  frameRate(20);
  
  var boundary = new Boundary(0, 0, 600, 600);
  var qt = new QuadTree(boundary, 4);
  
  for(var i = 0; i < 251; i++) {
    qt.insertPoint(new Point(Math.floor(random(0, 600)), Math.floor(random(0, 600))));
  }

  qt.showBoundary();
  qt.showPoints(); 
  
}

function draw() 
{ 


}
