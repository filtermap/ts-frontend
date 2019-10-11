import * as enums from "./enums";
import * as Vector from "./Vector";

export type Body = {
  type: enums.BodyType;
  acceleration: Vector.Vector;
  deceleration: number;
  velocity: Vector.Vector;
  restitution: number;
};

export function create({
  type,
  acceleration,
  deceleration,
  velocity,
  restitution
}: {
  type?: enums.BodyType;
  acceleration?: Vector.Vector;
  deceleration?: number;
  velocity?: Vector.Vector;
  restitution?: number;
}): Body {
  return {
    type: type || enums.BodyType.Dynamic,
    acceleration: acceleration || { x: 0, y: 0 },
    deceleration: deceleration || 1.0,
    velocity: velocity || { x: 0, y: 0 },
    restitution: restitution || 0.9
  };
}
