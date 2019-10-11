import * as enums from "./enums";
import * as Body from "./Body";
import * as Vector from "./Vector";

export type Line = {
  shape: enums.Shape.Line;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  vector: Vector.Vector;
  normal: Vector.Vector;
} & Body.Body;

export function create({
  x0,
  y0,
  x1,
  y1,
  type,
  acceleration,
  deceleration,
  velocity,
  restitution
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  type?: enums.BodyType;
  acceleration?: Vector.Vector;
  deceleration?: number;
  velocity?: Vector.Vector;
  restitution?: number;
}): Line {
  const vector = { x: x1 - x0, y: y1 - y0 };
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
  return {
    shape: enums.Shape.Line,
    x0: x0,
    y0: y0,
    x1: x1,
    y1: y1,
    vector,
    // 正規化された法線
    normal: Vector.multiply({ x: y0 - y1, y: x1 - x0 }, 1 / length),
    ...Body.create({
      type,
      acceleration,
      deceleration,
      velocity,
      restitution
    })
  };
}

export function translate(l: Line, x: number, y: number): Line {
  const x0 = l.x0 + x;
  const y0 = l.y0 + y;
  const x1 = l.x1 + x;
  const y1 = l.y1 + y;
  const vector = { x: x1 - x0, y: y1 - y0 };
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
  return {
    ...l,
    x0: x0,
    y0: y0,
    x1: x1,
    y1: y1,
    vector,
    normal: Vector.multiply({ x: y0 - y1, y: x1 - x0 }, 1 / length)
  };
}
