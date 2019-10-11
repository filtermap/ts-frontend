import * as enums from "./enums";
import * as Rectangle from "./Rectangle";
import * as Line from "./Line";
import * as Circle from "./Circle";
import * as Engine from "./Engine";

const colors = [
  "lightgray",
  "lightgray",
  "lightgray",
  "lightgray",
  "lightgray"
];

function render(
  engine: Engine.Engine,
  context: CanvasRenderingContext2D
): void {
  context.fillStyle = "white";
  context.fillRect(0, 0, 600, 600);
  for (let i = 0; i < engine.entities.length; i++) {
    const e = engine.entities[i];
    context.fillStyle = e.color;
    context.strokeStyle = e.color;
    switch (e.body.shape) {
      case enums.Shape.Rectangle:
        context.fillRect(e.body.x, e.body.y, e.body.width, e.body.height);
        break;
      case enums.Shape.Circle:
        context.beginPath();
        context.arc(e.body.x, e.body.y, e.body.radius, 0, Math.PI * 2);
        context.closePath();
        context.fill();
        break;
      case enums.Shape.Line:
        context.beginPath();
        context.moveTo(e.body.x0, e.body.y0);
        context.lineTo(e.body.x1, e.body.y1);
        context.stroke();
        break;
    }
  }
}

function createTicker(
  engine: Engine.Engine,
  context: CanvasRenderingContext2D
): () => void {
  return (): void => {
    engine = Engine.step(engine, 0.01);
    render(engine, context);
  };
}

function rand(n: number): number {
  return Math.floor(Math.random() * n);
}

function init(): void {
  const engine = Engine.create(0, 0, 600, 800, { x: 0, y: 9.8 });
  engine.entities.push({
    body: Rectangle.create({
      type: enums.BodyType.Static,
      x: 500,
      y: 50,
      width: 50,
      height: 400
    }),
    color: "lightgray"
  });
  engine.entities.push({
    body: Rectangle.create({
      type: enums.BodyType.Static,
      x: 0,
      y: 50,
      width: 50,
      height: 400
    }),
    color: "lightgray"
  });
  engine.entities.push({
    body: Line.create({
      type: enums.BodyType.Static,
      x0: 50,
      y0: 300,
      x1: 400,
      y1: 350
    }),
    color: "lightgray"
  });
  engine.entities.push({
    body: Line.create({
      type: enums.BodyType.Static,
      x0: 500,
      y0: 400,
      x1: 100,
      y1: 450
    }),
    color: "lightgray"
  });
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 3; j++) {
      const circle = Circle.create({
        type: enums.BodyType.Static,
        x: i * 60 + 100,
        y: j * 60 + 100,
        radius: 5
      });
      engine.entities.push({ body: circle, color: colors[j] });
    }
  }

  for (let i = 0; i < 20; i++) {
    const circle = Circle.create({
      type: enums.BodyType.Dynamic,
      x: rand(400) + 50,
      y: rand(200),
      radius: 10
    });
    circle.velocity.x = rand(10) - 5;
    circle.velocity.y = rand(10) - 5;
    engine.entities.push({ body: circle, color: colors[rand(5)] });
  }

  const context = (document.getElementById(
    "canvas"
  ) as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
  setInterval(createTicker(engine, context), 50);
}

window.addEventListener("DOMContentLoaded", init);
