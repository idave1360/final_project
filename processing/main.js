// p5.js
let canvasElem;
let off = { x: 0, y: 0 };
let dim = { w: 3200, h: 720 };

let font;
let title_screen;
let select_screen;
let select_dog;
let select_cat;
let select_sheep;
let sound_dog;
let sound_cat;
let sound_sheep;
// let lastSoundTime = 0;
// let SOUND_TIMEOUT = 5000; // 5초
let ending_screen;
let maze;
let level;
let gamecontroller;

let angle = 0; // angle을 여기서 전역 변수로 유지
let start_time;
let clear_time;
let collisionCount = 0;
let isMotorActive = false;

// opencv
let video;
let faceCascade;
// let faceDetected = false;
let faceDetected = true; // 디버깅용
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

let engine;
let world;
let runner;
let puppy;
let enemy;
let elements = [];
let characters = [];

function preload() {
  font = loadFont("assets/UI/neodgm_code.ttf");

  title_screen = loadImage("assets/UI/title_bg.png");
  select_screen = loadImage("assets/UI/select_bg.png");
  select_dog = loadImage("assets/UI/select_dog.png");
  select_cat = loadImage("assets/UI/select_cat.png");
  select_sheep = loadImage("assets/UI/select_sheep.png");
  ending_screen = loadImage("assets/UI/ending_bg.png");

  dog = loadImage("assets/character/puppy.png");
  // cat = loadImage("assets/character/cat.png");
  // sheep = loadImage("assets/character/sheep.png");

  sound_dog = loadSound("assets/character/sound_dog.mp3");
  sound_cat = loadSound("assets/character/sound_cat.mp3");
  sound_sheep = loadSound("assets/character/sound_sheep.mp3");

  maze = loadImage("assets/map/maze.png");
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

  // OpenCV 초기화 완료 후 실행될 콜백 설정
  cv["onRuntimeInitialized"] = () => {
    // 비디오 캡처 시작
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    // Haarcascade 파일 로딩
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

  // // 마지막으로 얼굴 감지된 시간과 현재 시간 비교
  // if (millis() - lastFaceDetectedTime <= FACE_DETECTION_TIMEOUT) {
  //   // 3초 내에 얼굴 감지 기록이 있으면 faceDetected=true
  //   faceDetected = true;
  // } else {
  //   // 3초 이상 감지 기록이 없으면 faceDetected=false 및 초기화
  //   faceDetected = false;
  //   World.clear(world);
  //   elements = [];
  //   characters = [];
  //   collisionCount = 0;
  //   gamecontroller.stage = 1;
  //   gamecontroller.c2 = true;
  // }

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
    image(title_screen, 0, 0, width, height);
  }
}

function keyPressed() {
  if (keyCode === 65 || keyCode === 97) {
    // A 혹은 a 키를 누르면 게임 리셋
    gamecontroller.resetstage2();
  }
}

function mouseClicked() {
  if (gamecontroller.stage === 1) {
    if (mouseX < width * 0.4) {
      level = "dog";
    } else if (mouseX < width * 0.6) {
      level = "cat";
    } else {
      level = "sheep";
    }
    gamecontroller.stage = 2;
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

function gotOpen() {
  isPortOpen = true;
  console.log("시리얼 포트가 열렸습니다.");
}

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

    const puppyBody =
      bodyA.label === "puppy" ? bodyA : bodyB.label === "puppy" ? bodyB : null;
    const groundBody = puppyBody === bodyA ? bodyB : bodyA;

    if (puppyBody && groundBody.label === "ground") {
      collisionCount++;
      console.log(`충돌 감지! 충돌 횟수: ${collisionCount}`);

      const speed = puppyBody.speed;
      console.log(`현재 가속도: ${speed}`);

      const SPEED_THRESHOLD = 5;
      if (speed > SPEED_THRESHOLD && !isMotorActive) {
        if (level === "dog") {
          sound_dog.play();
        } else if (level === "cat") {
          sound_cat.play();
        } else {
          sound_sheep.play();
        }
        activateMotor();
      }
    }

    const enemyBody =
      bodyA.label === "enemy" ? bodyA : bodyB.label === "enemy" ? bodyB : null;

    if (puppyBody && enemyBody) {
      console.log("puppy와 enemy가 충돌했습니다. 게임을 리셋합니다.");
      gamecontroller.resetstage2();
    }
  });
}

function activateMotor() {
  if (isPortOpen) {
    serial.write("MOTOR_ON\n");
    isMotorActive = true;
    console.log("진동 모터 작동!");

    setTimeout(() => {
      isMotorActive = false;
      console.log("진동 모터 정지!");
    }, 200);
  }
}

function detectFace() {
  if (!video || video.width === 0 || video.height === 0 || !faceCascade) return;

  let tempCanvas = document.createElement("canvas");
  tempCanvas.width = video.width;
  tempCanvas.height = video.height;
  let ctx = tempCanvas.getContext("2d");
  ctx.drawImage(video.elt, 0, 0, video.width, video.height);

  let src = cv.imread(tempCanvas);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  let faces = new cv.RectVector();
  let msize = new cv.Size(0, 0);
  faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);

  if (faces.size() > 0) {
    lastFaceDetectedTime = millis();
  }

  src.delete();
  gray.delete();
  faces.delete();
}
