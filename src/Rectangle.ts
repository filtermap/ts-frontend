import * as enums from "./enums";
import * as Body from "./Body";
import * as Vector from "./Vector";

export type Rectangle = {
  shape: enums.Shape.Rectangle;
  x: number;
  y: number;
  width: number;
  height: number;
} & Body.Body;

export function create({
  x,
  y,
  width,
  height,
  type,
  acceleration,
  deceleration,
  velocity,
  restitution
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: enums.BodyType;
  acceleration?: Vector.Vector;
  deceleration?: number;
  velocity?: Vector.Vector;
  restitution?: number;
}): Rectangle {
  return {
    shape: enums.Shape.Rectangle,
    x,
    y,
    width,
    height,
    ...Body.create({
      type,
      acceleration,
      deceleration,
      velocity,
      restitution
    })
  };
}

export function translate(r: Rectangle, x: number, y: number): Rectangle {
  return {
    ...r,
    x: r.x + x,
    y: r.y + y
  };
}

export function isIn(x: number, y: number, r: Rectangle): boolean {
  return r.x <= x && x <= r.x + r.width && r.y <= y && y <= r.y + r.height;
}
