var numberParticlesStart = 100;
var numberParticlesAdded = 20;
var particleMaxSize = 10;
var lifeTime = 3;
var interactionMouseArea = 100;
var wireDistance = 100;

var putOff = true;
var fusion = false;


var particles = [];
var mouseX = 0;
var mouseY = 0;

var canvas = document.createElement('canvas');
var context = canvas.getContext("2d"); 

canvas.id="canvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.addEventListener('click',addParticles);
canvas.addEventListener('mousemove',recordMousePosition);
canvas.addEventListener('mouseout',makeMouseOut);

document.body.appendChild(canvas);

context.globalCompositeOperation = 'lighter';


function Particle (x, y, size) {
    this.initX = x;
    this.initY = y;
    this.x = x;
    this.y = y;
    this.size = size;
    this.velX = Math.random()*2;
    this.velY = Math.random()*3+1;
    this.color = '#'+Math.floor(Math.random()*15456415-1000).toString(16);
    this.age = 0.999;
    this.cycle = 0;
    this.particles;
}

Particle.prototype.init = function init () {
    this.cycle++;
    this.age = 0.999;
    this.x = _.random(0, canvas.width);
    this.y = -this.size;
}

Particle.prototype.render = function render () {
    var alpha = (1000 - Math.min(this.age, 1000))/1000;

    context.beginPath();
    context.globalAlpha = alpha;
    context.fillStyle = this.color;
    context.arc(this.x,this.y,this.size,0,Math.PI*2);
    context.fill();
}

Particle.prototype.update = function update (mouseX, mouseY){
    
    if (this.y+this.velY+this.size-1 <= canvas.height && this.age < 1 ) {
        var posRelativeToMouse = {
            x : this.x - mouseX,
            y : this.y - mouseY
        };

        var distance = Math.sqrt( Math.pow(posRelativeToMouse.x,2) + Math.pow(posRelativeToMouse.y,2) );
        var force = (interactionMouseArea - distance) / interactionMouseArea;

        if (force < 0) {
            force = 0;
        }

        var forceDirection = {
            x :  (posRelativeToMouse.x / distance)*force,
            y :  (posRelativeToMouse.y / distance)*force
        };
    
    if (putOff) {
        this.y = this.y + this.velY + forceDirection.y;
        this.x = Math.sin(this.velX*5) + this.x + forceDirection.x;
    } else {
        this.y = this.y + this.velY - forceDirection.y;
        this.x = Math.sin(this.velX*5) + this.x - forceDirection.x;
    }

    } else {
        this.age *= 1.1;
        if (this.age > 1000) {
            this.init();
        }
    }
}

Particle.prototype.checkColision = function checkColision (particles) {
    var that = this;
    this.particles = particles;

    _.each(particles, function(p){

        if (p.age > 1) {
            var dx = that.x - p.x;
            var dy = that.y - p.y;

            var distance = Math.sqrt(dx * dx + dy * dy); 

            if (distance < that.size + p.size) {
                that.age = 1.1;
            }
        }       
    });
}

Particle.prototype.renderLinks = function (mouseX, mouseY) {
    var distance = Math.sqrt( Math.pow(this.x - mouseX, 2) + Math.pow(this.y - mouseY, 2)); // PYTAGOREEEE

    if (distance < wireDistance ) {
        context.beginPath();
        context.moveTo(mouseX, mouseY);
        context.lineTo(this.x, this.y);
        context.strokeStyle = this.color;
        context.stroke();
    }
}


/* ---- Functions ----*/
    
function loop(){
    context.clearRect(0,0, canvas.width, canvas.height);

    particles = _.filter(particles,function(particles) {
        return particles.cycle < lifeTime ;
    });

    _.chain(particles).each(function(p, index){
        p.update(mouseX, mouseY);
        if (fusion) {
            p.checkColision(  _.without(particles, p) );
        }
        p.renderLinks(mouseX,mouseY);
    }).each(function(p){
        p.render();
    });
    requestAnimationFrame(loop);
}

function addParticles (e) {
    for (var i = 0; i < numberParticlesAdded ; i++) {
        particles.push(new Particle(
            e.x+1,
            e.y-10,
            _.random(0, particleMaxSize))
        );
    }
}

function recordMousePosition (e) {
    mouseX = e.x;
    mouseY = e.y;
}

function makeMouseOut(e){
    mouseX = 9999;
    mouseY= 9999;
}


/* ---- START ---- */

for (var i = 0; i < numberParticlesStart ; i++) {
    particles.push(new Particle(
        _.random(0, canvas.width),
        _.random(0, canvas.height),
        _.random(0, particleMaxSize))
    );
}

loop();
