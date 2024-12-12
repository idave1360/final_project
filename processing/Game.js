class Game {
  constructor() {
    this.stage = 2;
    this.c1 = true;
    this.c2 = true;
  }

  resetstage2() {
    World.clear(world);
    elements = [];
    this.c2 = true;
  }

  stageclear() {
    World.clear(world);
    elements = [];
    this.stage += 1;
  }

  stage1() {
    if (this.c1) {
      World.clear(world);
      elements = [];
    }
  }

  stage2() {
    if (this.c2) {
      dim = { w: 720, h: height };

      puppy = new Block(
        world,
        {
          x: -250,
          y: 0,
          w: 100,
          h: 70,
          image: loadImage("assets/character/puppy.png"),
        },
        {
          label: "puppy",
          density: 0.004,
          restitution: 0.5,
          friction: 0.0,
          frictionAir: 0.0,
        }
      );
      elements.push(puppy);

      enemy = new Block(
        world,
        {
          x: -50,
          y: -250,
          w: 70,
          h: 70,
          image: loadImage("assets/character/enemy.png"),
        },
        {
          label: "enemy",
          density: 0.004,
          restitution: 0.5,
          friction: 0.0,
          frictionAir: 0.0,
        }
      );
      elements.push(enemy);

      // boundary
      elements.push(
        new BlockCore(
          world,
          { x: 0, y: -325, w: 700, h: 50, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.1,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: 0, y: 325, w: 700, h: 50, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.1,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: -325, y: 0, w: 50, h: 700, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.1,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: 325, y: 0, w: 50, h: 700, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.1,
            frictionAir: 0.0,
          }
        )
      );

      // maze
      elements.push(
        new BlockCore(
          world,
          { x: -250, y: 50, w: 100, h: 20, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );

      elements.push(
        new BlockCore(
          world,
          { x: -300, y: 180, w: 40, h: 20, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: -80, y: 40, w: 20, h: 300, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: -120, y: -80, w: 100, h: 20, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: -160, y: -140, w: 20, h: 130, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: -80, y: -200, w: 280, h: 20, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: 50, y: -260, w: 20, h: 130, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: 50, y: 120, w: 20, h: 380, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: -120, y: 180, w: 80, h: 20, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: 90, y: -80, w: 100, h: 20, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: 250, y: 50, w: 120, h: 20, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
      elements.push(
        new BlockCore(
          world,
          { x: 100, y: 180, w: 120, h: 20, color: "brown" },
          {
            isStatic: true,
            label: "ground",
            density: 0.004,
            restitution: 0.5,
            friction: 0.0,
            frictionAir: 0.0,
          }
        )
      );
    }

    this.c2 = false;

    push();
    translate(width / 2, height / 2);
    rotate(angle);

    // imageMode(CENTER);
    // image(backgroundimage, 0, 0, 2048, 2048);

    fill(255);
    rectMode(CENTER);
    rect(0, 0, 700, 700);

    image(goal, 80, 220, 50, 50);

    elements.forEach((element) => element.draw());

    engine.world.gravity.x = cos(-angle + 0.5 * PI);
    engine.world.gravity.y = sin(-angle + 0.5 * PI);

    if (
      puppy.body.position.x > 40 &&
      puppy.body.position.x < 150 &&
      puppy.body.position.y > 190 &&
      puppy.body.position.y < 310
    ) {
      this.resetstage2();
    }

    pop();
  }

  stage3() {}
}
