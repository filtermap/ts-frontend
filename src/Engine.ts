import produce from "immer";
import * as enums from "./enums";
import * as Vector from "./Vector";
import * as Rectangle from "./Rectangle";
import * as Line from "./Line";
import * as Circle from "./Circle";

type Entity = {
  body: Rectangle.Rectangle | Line.Line | Circle.Circle;
  color: string;
};

export type Engine = {
  worldX: number;
  worldY: number;
  worldW: number;
  worldH: number;
  gravity: Vector.Vector;
  entities: Entity[];
};

export function create(
  x: number,
  y: number,
  width: number,
  height: number,
  gravity: Vector.Vector
): Engine {
  return {
    worldX: x || 0,
    worldY: y || 0,
    worldW: width || 1000,
    worldH: height || 1000,
    gravity,
    entities: []
  };
}

function translate(entity: Entity): Entity {
  switch (entity.body.shape) {
    case enums.Shape.Rectangle:
      return {
        ...entity,
        body: Rectangle.translate(
          entity.body,
          entity.body.velocity.x,
          entity.body.velocity.y
        )
      };
    case enums.Shape.Circle:
      return {
        ...entity,
        body: Circle.translate(
          entity.body,
          entity.body.velocity.x,
          entity.body.velocity.y
        )
      };
    case enums.Shape.Line:
      return {
        ...entity,
        body: Line.translate(
          entity.body,
          entity.body.velocity.x,
          entity.body.velocity.y
        )
      };
    default:
      throw new Error();
  }
}

export function step(engine: Engine, elapsed: number): Engine {
  return produce(engine, engine => {
    const gravity = Vector.multiply(engine.gravity, elapsed);

    // entityを移動
    engine.entities = engine.entities.map(function(entity) {
      if (entity.body.type === enums.BodyType.Static) return entity;
      const acceleration = Vector.multiply(entity.body.acceleration, elapsed);
      entity.body.velocity = Vector.add(entity.body.velocity, gravity);
      entity.body.velocity = Vector.add(entity.body.velocity, acceleration);
      entity.body.velocity = Vector.multiply(
        entity.body.velocity,
        entity.body.deceleration
      );
      return translate(entity);
    });

    // 範囲外のオブジェクトを削除
    engine.entities = engine.entities.filter(entity => {
      switch (entity.body.shape) {
        case enums.Shape.Line: {
          const [left, right] =
            entity.body.x0 < entity.body.x1
              ? [entity.body.x0, entity.body.x1]
              : [entity.body.x1, entity.body.x0];
          const [top, bottom] =
            entity.body.y0 < entity.body.y1
              ? [entity.body.y0, entity.body.y1]
              : [entity.body.y1, entity.body.y0];
          return (
            engine.worldX < right &&
            left < engine.worldX + engine.worldW &&
            engine.worldY < top &&
            bottom < engine.worldY + engine.worldH
          );
        }
        default:
          return (
            engine.worldX <= entity.body.x &&
            entity.body.x <= engine.worldX + engine.worldW &&
            engine.worldY <= entity.body.y &&
            entity.body.y <= engine.worldY + engine.worldH
          );
      }
    });

    // 衝突判定 & 衝突処理
    for (let i = 0; i < engine.entities.length - 1; i++) {
      for (let j = i + 1; j < engine.entities.length; j++) {
        const entityI = engine.entities[i],
          entityJ = engine.entities[j];
        if (
          entityI.body.type === enums.BodyType.Static &&
          entityJ.body.type === enums.BodyType.Static
        )
          continue;
        if (
          entityI.body.shape === enums.Shape.Circle &&
          entityJ.body.shape === enums.Shape.Circle
        ) {
          [entityI.body, entityJ.body] = Circle.collidedWithCircle(
            entityI.body,
            entityJ.body
          );
        } else if (
          entityI.body.shape === enums.Shape.Circle &&
          entityJ.body.shape === enums.Shape.Line
        ) {
          [entityI.body, entityJ.body] = Circle.collidedWithLine(
            entityI.body,
            entityJ.body
          );
        } else if (
          entityI.body.shape === enums.Shape.Line &&
          entityJ.body.shape === enums.Shape.Circle
        ) {
          [entityJ.body, entityI.body] = Circle.collidedWithLine(
            entityJ.body,
            entityI.body
          );
        } else if (
          entityI.body.shape === enums.Shape.Circle &&
          entityJ.body.shape === enums.Shape.Rectangle
        ) {
          [entityI.body, entityJ.body] = Circle.collidedWithRect(
            entityI.body,
            entityJ.body
          );
        } else if (
          entityI.body.shape === enums.Shape.Rectangle &&
          entityJ.body.shape === enums.Shape.Circle
        ) {
          [entityJ.body, entityI.body] = Circle.collidedWithRect(
            entityJ.body,
            entityI.body
          );
        }
      }
    }
  });
}
