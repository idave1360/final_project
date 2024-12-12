// p5.js
let canvasElem;
let off = { x: 0, y: 0 };
let dim = { w: 3200, h: 720 };

let font;
let title;
let gamecontroller;

let angle = 0; // angle을 여기서 전역 변수로 유지
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

// keyPressed에서 포트 상태 확인
function keyPressed() {
  if (keyCode === 82) {
    if (isPortOpen) {
      serial.write("MOTOR_ON\n");
      console.log("MOTOR_ON 명령 전송");
    } else {
      console.error("시리얼 포트가 열려있지 않습니다.");
    }
  }
}

function serverConnected() {
  console.log("시리얼 서버에 연결되었습니다.");
}

function gotList(ports) {
  console.log("사용 가능한 시리얼 포트:", ports);
  if (ports.length > 0) {
    // 여기서 사용 가능한 포트로 변경하세요.
    // 실제 환경에 맞는 포트 이름 사용 필수
    serial.openPort("/dev/tty.usbserial-A50285BI", { baudRate: 115200 });
  } else {
    console.error("사용 가능한 포트가 없습니다.");
  }
}

let isPortOpen = false; // 포트 상태를 추적하는 변수

// 포트가 열렸을 때 상태 업데이트
function gotOpen() {
  isPortOpen = true;
  console.log("시리얼 포트가 열렸습니다.");
}

// 포트가 닫혔을 때 상태 업데이트
function gotClose() {
  isPortOpen = false;
  console.log("시리얼 포트가 닫혔습니다.");
}

function gotError(theerror) {
  console.log("에러: " + theerror);
}

function gotData() {
  let currentString = serial.readLine();
  currentString = currentString.trim();
  if (!currentString) return;
  console.log(currentString);

  // yaw,pitch,roll 데이터 파싱 (이미 구현된 부분이라 가정)
  let values = currentString.split(",");
  if (values.length === 3) {
    let yawDeg = parseFloat(values[0]);
    let pitchDeg = parseFloat(values[1]);
    let rollDeg = parseFloat(values[2]);
    angle = yawDeg * (Math.PI / 180);
  }
}
