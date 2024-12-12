// p5.js
let canvasElem;
let off = { x: 0, y: 0 };
let dim = { w: 3200, h: 720 };

let font;
let title;
let gamecontroller;

let angle = 0; // angle을 여기서 전역 변수로 유지
let collisionCount = 0;
let isMotorActive = false;
let goal;
let backgroundimage;

// opencv
let video;
let faceCascade;
let faceDetected = false;
let lastFaceDetectedTime = 0;
const FACE_DETECTION_TIMEOUT = 3000; // 3초 미검출 시 리셋

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
// var Events = Matter.Events;

let engine;
let world;
let runner;
let puppy;
let enemy;
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

  Matter.Events.on(engine, "collisionStart", handleCollisionStart);

  dim = { w: 720, h: height };

  // OpenCV 설정
  cv["onRuntimeInitialized"] = () => {
    // 비디오 캡쳐 설정
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    let cascadeFile = "haarcascade_frontalface_default.xml";
    fetch(cascadeFile)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        let data = new Uint8Array(buffer);
        cv.FS_createDataFile("/", cascadeFile, data, true, false, false);
        faceCascade = new cv.CascadeClassifier();
        faceCascade.load(cascadeFile);
        // 얼굴 인식 주기적 수행
        setInterval(detectFace, 100);
      })
      .catch((err) => console.error("Haarcascade 로드 실패:", err));
  };
}

function draw() {
  clear();

  // 마지막으로 얼굴 감지된 시간과 현재 시간 비교
  if (millis() - lastFaceDetectedTime <= FACE_DETECTION_TIMEOUT) {
    // 3초 내에 얼굴 감지 기록이 있으면 faceDetected=true
    faceDetected = true;
  } else {
    // 3초 이상 감지 기록이 없으면 faceDetected=false 및 초기화
    faceDetected = false;
    // gamecontroller.c1 = true;
    // gamecontroller.stage = 2;
    gamecontroller.resetstage2();
  }

  if (faceDetected) {
    switch (gamecontroller.stage) {
      case 1:
        gamecontroller.stage1();
        break;
      case 2:
        gamecontroller.stage2();
        break;
      case 3:
        gamecontroller.stage3();
        break;
    }
  } else {
    image(title, width / 4, height / 4, width / 2, height / 2);
  }
}

// keyPressed에서 포트 상태 확인
function keyPressed() {
  if (keyCode === 82) {
    // if (isPortOpen) {
    //   serial.write("MOTOR_ON\n");
    //   console.log("MOTOR_ON 명령 전송");
    // } else {
    //   console.error("시리얼 포트가 열려있지 않습니다.");
    // }
  }
}

function serverConnected() {
  console.log("시리얼 서버에 연결되었습니다.");
}

function gotList(ports) {
  console.log("사용 가능한 시리얼 포트:", ports);
  if (ports.length > 0) {
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

  // yaw,pitch,roll 데이터 파싱
  let values = currentString.split(",");
  if (values.length === 3) {
    let yawDeg = parseFloat(values[0]);
    let pitchDeg = parseFloat(values[1]);
    let rollDeg = parseFloat(values[2]);
    angle = yawDeg * (Math.PI / 180);
  }
}

function handleCollisionStart(event) {
  const pairs = event.pairs;

  pairs.forEach((pair) => {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    // puppy와 ground 간 충돌 확인
    const puppyBody =
      bodyA.label === "puppy" ? bodyA : bodyB.label === "puppy" ? bodyB : null;
    const groundBody = puppyBody === bodyA ? bodyB : bodyA;

    if (puppyBody && groundBody.label === "ground") {
      collisionCount++; // 충돌 카운터 증가
      console.log(`충돌 감지! 충돌 횟수: ${collisionCount}`);

      // puppy의 가속도 확인
      const speed = puppyBody.speed;
      console.log(`현재 가속도: ${speed}`);

      // 특정 가속도 이상일 경우 진동 모터 작동
      const SPEED_THRESHOLD = 5; // 속도 임계값
      if (speed > SPEED_THRESHOLD && !isMotorActive) {
        activateMotor(); // 모터 작동 함수 호출
      }
    }

    // puppy와 enemy 간 충돌 확인
    const enemyBody =
      bodyA.label === "enemy" ? bodyA : bodyB.label === "enemy" ? bodyB : null;

    if (puppyBody && enemyBody) {
      console.log("puppy와 enemy가 충돌했습니다. 게임을 리셋합니다.");
      gamecontroller.resetstage2(); // 게임 리셋 함수 호출
    }
  });
}

function activateMotor() {
  if (isPortOpen) {
    serial.write("MOTOR_ON\n");
    isMotorActive = true; // 모터 상태 활성화
    console.log("진동 모터 작동!");

    // 200ms 후 모터 상태 초기화
    setTimeo