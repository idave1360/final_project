// p5.js
let canvasElem;
let off = { x: 0, y: 0 };
let dim = { w: 3200, h: 720 };

let font;
let title;
let gamecontroller;

let angle = 0;
let goal;
let backgroundimage;

// serialport
let serial;
let latestData = "";

// matter.js
var Engine = Matter.Engine;
var Runner = Matter.Runner;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Vertices = Matter.Vertices;
var Vector = Matter.Vector;

let engine;
let world;
let runner;
let puppy;
let elements = [];

function preload() {
  font = loadFont("assets/UI/neodgm_code.ttf");
  title = loadImage("assets/UI/title.png");

  goal = loadImage("assets/UI/goal.png");
  backgroundimage = loadImage("assets/map/background.png");
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("thecanvas");
  canvasElem = document.getElementById("thecanvas");

  // 시리얼 포트 객체 생성
  serial = new p5.SerialPort("localhost", 8081);

  // 시리얼 이벤트 콜백 함수 설정
  serial.on("connected", serverConnected);
  serial.on("list", gotList);
  serial.on("data", gotData);
  serial.on("error", gotError);
  serial.on("open", gotOpen);
  serial.on("close", gotClose);

  // 시리얼 서버에 연결
  serial.list(); // 사용 가능한 포트 목록 요청

  // matter.js default setting
  engine = Engine.create();
  world = engine.world;
  Runner.run(engine);

  gamecontroller = new Game();
}

function draw() {
  clear();

  switch (gamecontroller.stage) {
    case 0:
      gamecontroller.stage0();
      break;

    case 1:
      gamecontroller.stage1();
      break;
  }
}

// function scrollEndless(point) {
//     off = { x: Math.min(Math.max(0, point.x - windowWidth / 2), dim.w -  windowWidth), y: Math.min(Math.max(0, point.y - windowHeight / 2), dim.h -  windowHeight) };
//     canvasElem.style.left = Math.round(off.x) + 'px';
//     canvasElem.style.top = Math.round(off.y) + 'px';
//     translate(-off.x, -off.y);
//     window.scrollTo(off.x, off.y);
//   }

// function keyPressed(event) {
function keyPressed() {
  if (keyCode === 82) {
    // switch (gamecontroller.stage) {
    //   case 1:
    //     gamecontroller.resetstage1();
    //     break;
    //   case 2:
    //     gamecontroller.resetstage2();
    //     break;
    // }
  }
}

function serverConnected() {
  console.log("시리얼 서버에 연결되었습니다.");
}

function gotList(ports) {
  console.log("사용 가능한 시리얼 포트:", ports);
  if (ports.length > 0) {
    serial.openPort("/dev/tty.usbserial-A50285BI", { baudRate: 9600 });
  } else {
    console.error("사용 가능한 포트가 없습니다.");
  }
}

function gotOpen() {
  console.log("시리얼 포트가 열렸습니다.");
}

function gotClose() {
  console.log("시리얼 포트가 닫혔습니다.");
}

function gotError(theerror) {
  console.log("에러: " + theerror);
}

function gotData() {
  let currentString = serial.readLine(); // 한 줄씩 데이터 읽기
  trim(currentString); // 공백 제거
  if (!currentString) return; // 빈 문자열 무시
  console.log(currentString); // 콘솔에 출력
  latestData = currentString; // 받은 데이터를 저장
}
