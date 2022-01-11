const cnvs=document.querySelector("canvas");

const c = cnvs.getContext("2d");

cnvs.height = window.innerHeight;
cnvs.width = window.innerWidth;

//getting html element for dispalying live score
var scoreTop = document.querySelector("#score");
//start/play again button
var gameBtn = document.querySelector("#game-btn");
//div for showing score and initializing game
var gamePage = document.querySelector("#game-init");
//total score html element
var totalScore = document.querySelector("#game-score");

//class for creating player object
class Player {
    constructor(x,y,r,color){
        this.x=x;
        this.y=y;
        this.r=r;
        this.color=color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
    }
}

//class for creating shooting objects
class Projectile{
    constructor(x,y,r,vx,vy,color){
        this.x=x;
        this.y=y;
        this.r=r;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x += this.vx;
        this.y += this.vy;
    }
}

//class for creating enemy objects
class Enemy{
    constructor(x,y,r,vx,vy,color){
        this.x=x;
        this.y=y;
        this.r=r;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x += this.vx;
        this.y += this.vy;
    }
}

//class for creting particles after hitting enemy
class Particle{
    constructor(x,y,r,vx,vy,color){
        this.x=x;
        this.y=y;
        this.r=r;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
        this.opacity =1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
        c.restore();
    }
    update(){
        this.draw();
        //opacity decreases over time
        this.opacity -= 0.02;
        //velocity decreases over time
        this.vx *= f;
        this.vy *= f;
        //updating velocity
        this.x += this.vx;
        this.y += this.vy;
    }
}

//creating player object
const player = new Player(cnvs.width/2,cnvs.height/2,15,"#fff");

//array of projectiles
var proArr = [];
//array of enemies
var enemyArr = [];
//array of partcles
var partArr = [];
//friction
var f=0.99;
//game score
var score=0;

//listening clicks to create projectiles
window.addEventListener("click", function(event) {
    //ceter of canvas
    var x=cnvs.width/2;
    var y=cnvs.height/2;
    //distane between center and mouse click
    var d=Math.pow(Math.pow(event.x-x,2)+Math.pow(event.y-y,2),.5);
    //calculating x and y velo of the projectile for hitting target
    var vx = (event.x-x)/d *4;
    var vy = (event.y-y)/d *4;
    //initializing object and pushing in the array
    proArr.push(new Projectile(x,y,5,vx,vy,"#fff")); 
})

//id for stopping animation when game over
var animateId;
//animation
function animate(){
    //request animation and storing id for future use
    animateId = requestAnimationFrame(animate);
    //background filling
    c.fillStyle='rgb(0, 0, 0, 0.1)';
    c.fillRect(0,0,cnvs.width,cnvs.height);
    //drawing palyer
    player.draw();

    //iterating projectiles array and updating
    proArr.forEach((p,i)=>{
        p.update();
        //checking if the object is outside of canvas and deleting the object
        if(p.x < 0-p.r || p.x > cnvs.width+p.r || p.y < 0-p.r || p.y > cnvs.height + p.r){
            setTimeout(() => {
                proArr.splice(i,1);
            }, 0);
        }
    })
    //iterating enemy array
    enemyArr.forEach((e,i) => {
        e.update();
        //distance between player and enemy
        var d = Math.hypot(player.x-e.x,player.y-e.y);
        //if enemy touches palyer player loses
        if(d<player.r + e.r +1){
            //stopping animation
            cancelAnimationFrame(animateId);
            //updating the total score and showing score
            totalScore.innerHTML = score;
            gameBtn.innerHTML = "Play Again";
            gamePage.style.display = "block";

        }
        //iterating projectiles array for checking enemy hitting
        proArr.forEach((p,j)=>{
            //distance between enemy and projectile
            var dist = Math.hypot(p.x-e.x,p.y-e.y);
            //checking if projectile is hiiting enemy
            if(dist < p.r + e.r + 1){
                //creating particles
                for(let k=0; k<e.r;k++){
                    partArr.push(new Particle(e.x,e.y,Math.random()*3,(Math.random()-.5)*6, (Math.random()-.5)*6,e.color));
                }
                //checking for enemy radius and shrinking it after hitting
                if(e.r >= 20){
                    score +=50;
                    //smooting shrinking effect
                    gsap.to(e, { r: e.r-10});
                    //deleting projectile
                    setTimeout(() => {
                        proArr.splice(j,1);
                    }, 0);
     
                    
                }
                //enemy destroyed 
                else{
                    score +=100;
                    setTimeout(() => {
                        enemyArr.splice(i,1);
                        proArr.splice(j,1);
                    }, 0);
                }
                //updating live score
                scoreTop.innerHTML = score;
            }
        })
    });
    //iterating particle array and updating position and deleting when opacity is low
    partArr.forEach((p,i) =>{
        if(p.opacity <=0){
            partArr.splice(i,1);
        }
        else{
            p.update();
        }
    })
}
//spawning enemies from random position with random properties
function spawnEnimies() {
    //spawning one by one
    setInterval(() => {
        var r=Math.random()*20 +10;
        var x;
        var y;
        var randColor = `hsl(${Math.random()*160},30%,50%)`;
        //generating random position
        if(Math.random()<0.5){
            x=Math.random()<0.5 ? -r : cnvs.width+r;
            y=Math.random()*cnvs.height;
        }
        else{
            x=Math.random()*cnvs.width;
            y=Math.random()<0.5 ? -r : cnvs.height+r;
        }
        //determinig x and y velo to hit the player
        var d=Math.pow(Math.pow(cnvs.width/2-x,2)+Math.pow(cnvs.height/2-y,2),.5);
        var vx=(cnvs.width/2-x)/d;
        var vy=(cnvs.height/2-y)/d;
        //creating objects
        enemyArr.push(new Enemy(x,y,r,vx,vy,randColor));
    }, 1000);
    
}
//initializing the game
function init() {
    proArr = [];
    enemyArr = [];
    partArr = [];
    score=0;
    animate();
    spawnEnimies();
}

//start game/play game button
gameBtn.addEventListener("click",function() {
    //starting game
    init();
    //initializing live score to 0
    scoreTop.innerHTML = '0';
    //hiding the div
    gamePage.style.display = 'none';
})