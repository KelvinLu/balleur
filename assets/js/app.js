var airhorn = new Audio('assets/sound/airhorn.wav');
var balleur = document.querySelector('#balleur');

Box = function(elem, ball) {
  this.elem = elem;
  this.ball = ball;

  var rect = elem.getBoundingClientRect();

  this.x1 = rect.left;
  this.y1 = rect.top;
  this.x2 = rect.right;
  this.y2 = rect.bottom;
};

Box.prototype.checkBounds = function() {
  if ((this.x1 > this.ball.x) || (this.x2 < this.ball.x + this.ball.w)) {
    this.ball.dx *= -0.8;
    this.ball.dy *= 0.9;
    this.ball.x = (this.x1 > this.ball.x) ? this.x1 : this.x2 - this.ball.w;
  }

  if ((this.y1 > this.ball.y) || (this.y2 < this.ball.y + this.ball.h)) {
    this.ball.dy *= -0.8;
    this.ball.dx *= 0.9;
    this.ball.y = (this.y1 > this.ball.y) ? this.y1 : this.y2 - this.ball.h;
  }
};

Basket = function(elem, ball) {
  this.elem = elem;
  this.ball = ball;

  var rect = elem.getBoundingClientRect();

  this.x1 = rect.left;
  this.y1 = rect.top;
  this.x2 = rect.right;
  this.y2 = rect.bottom;

  this.lock_time = false;
  this.lock_pos = false;
};

Basket.prototype.score = function() {
  if (this.lock_time || this.lock_pos) return;

  this.lock_time = this.lock_pos = true;

  airhorn.load();
  airhorn.play();

  balleur.classList.add('flash');

  setTimeout(this.unlockTime.bind(this), 2000);
};

Basket.prototype.unlockPos = function() {
  this.lock_pos = false;
};

Basket.prototype.unlockTime = function() {
  this.lock_time = false;

  balleur.classList.remove('flash');
};

Basket.prototype.checkBounds = function() {
  if (this.y1 > this.ball.y + this.ball.h * 0.5) {
    if ((this.x1 < this.ball.x) && (this.x2 > this.ball.x + this.ball.w)) this.unlockPos();
    return;
  };

  if (this.y2 < this.ball.y + this.ball.h + 5) {
    if ((this.x1 < this.ball.x) && (this.x2 > this.ball.x + this.ball.w)) this.score();
    return;
  }

  if (this.ball.dx > 0) {
    if ((this.x1 < this.ball.x + this.ball.w) && (this.x1 > this.ball.x)) {
      this.ball.x = this.x1 - this.ball.w;
    } else if ((this.x2 < this.ball.x + this.ball.w) && (this.x2 > this.ball.x)) {
      this.ball.x = this.x2 - this.ball.w;
    } else return;
  }
  else if (this.ball.dx < 0) {
    if ((this.x2 > this.ball.x) && (this.x2 < this.ball.x + this.ball.w)) {
      this.ball.x = this.x2;
    }
    else if ((this.x1 > this.ball.x) && (this.x1 < this.ball.x + this.ball.w)) {
      this.ball.x = this.x1;
    } else return;
  } else return;

  this.ball.dx *= -0.8;
  this.ball.dy *= 0.9;
};

Ball = function(elem) {
  this.elem = elem;

  var rect = elem.getBoundingClientRect();

  this.h = rect.height;
  this.w = rect.width;

  this.x = rect.left;
  this.y = rect.top;

  this.dx = 4;
  this.dy = 0;

  this.held = false;
  this.bindMouse();
};

Ball.prototype.bindMouse = function() {
  var self = this;

  var hold = function(e) {
    self.held = true;
    self.dx = 0;
    self.dy = 0;

    self.elem.classList.add('held');

    e.preventDefault();
  };
  var release = function(e) {
    if (self.held) {
      self.held = false;
      self.dx = e.movementX;
      self.dy = e.movementY;

      self.elem.classList.remove('held');
    }

    e.preventDefault();
  };

  var move = function(e) {
    if (self.held) {
      self.x += e.movementX;
      self.y += e.movementY;
    }

    self.update();

    e.preventDefault();
  };

  this.elem.addEventListener('mousedown', hold);
  this.elem.addEventListener('mouseout', release);
  this.elem.addEventListener('mousemove', move);
};

Ball.prototype.gravity = function() {
  if (!this.held) this.dy += 0.2;
};

Ball.prototype.move = function() {
  this.x += this.dx;
  this.y += this.dy;
};

Ball.prototype.update = function() {
  this.elem.style.left = this.x;
  this.elem.style.top = this.y;

  this.elem.style['filter'] = "blur("+ (Math.log(1 + Math.sqrt((this.dx * this.dx) + (this.dy + this.dy))) * 0.8).toString() +"px)";
  this.elem.style['-moz-filter'] = "blur("+ (Math.log(1 + Math.sqrt((this.dx * this.dx) + (this.dy + this.dy))) * 0.8).toString() +"px)";
  this.elem.style['-webkit-filter'] = "blur("+ (Math.log(1 + Math.sqrt((this.dx * this.dx) + (this.dy + this.dy))) * 0.8).toString() +"px)";
};


ball = new Ball(document.querySelector('#ball'));

box = new Box(document.querySelector('#box'), ball);
basket = new Basket(document.querySelector('#basket'), ball);



setInterval(function() {
  ball.gravity();
  ball.move();

  box.checkBounds();
  basket.checkBounds();

  ball.update();
}, 10);
