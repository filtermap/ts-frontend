import * as enums from "./enums";
import * as Body from "./Body";
import * as Vector from "./Vector";
import * as Line from "./Line";
import * as Rectangle from "./Rectangle";

export type Circle = {
  shape: enums.Shape.Circle;
  x: number;
  y: number;
  radius: number;
} & Body.Body;

export function create({
  x,
  y,
  radius,
  type,
  acceleration,
  deceleration,
  velocity,
  restitution
}: {
  x: number;
  y: number;
  radius: number;
  type?: enums.BodyType;
  acceleration?: Vector.Vector;
  deceleration?: number;
  velocity?: Vector.Vector;
  restitution?: number;
}): Circle {
  return {
    shape: enums.Shape.Circle,
    x,
    y,
    radius,
    ...Body.create({
      type,
      acceleration,
      deceleration,
      velocity,
      restitution
    })
  };
}

export function translate(c: Circle, x: number, y: number): Circle {
  return {
    ...c,
    x: c.x + x,
    y: c.y + y
  };
}

function isHit(c: Circle, x: number, y: number): boolean {
  return (x - c.x) ** 2 + (y - c.y) ** 2 < c.radius ** 2;
}

export function collidedWithRect(
  c: Circle,
  r: Rectangle.Rectangle
): [Circle, Rectangle.Rectangle] {
  // 円と矩形の衝突
  // 矩形の４辺上で最も円に近い座標(nx, ny)を求める
  const nx = Math.max(r.x, Math.min(c.x, r.x + r.width));
  const ny = Math.max(r.y, Math.min(c.y, r.y + r.height));
  if (!isHit(c, nx, ny)) {
    // 衝突なし→リターン
    return [c, r];
  }
  const d2 = (nx - c.x) ** 2 + (ny - c.y) ** 2;
  const overlap = Math.abs(c.radius - Math.sqrt(d2));
  let mx = 0;
  let my = 0;
  if (ny === r.y) {
    // 上辺衝突
    my = -overlap;
  } else if (ny === r.y + r.height) {
    // 下辺衝突
    my = overlap;
  } else if (nx === r.x) {
    // 左辺衝突
    mx = -overlap;
  } else if (nx === r.x + r.width) {
    // 右辺衝突
    mx = overlap;
  } else {
    // 矩形の中
    mx = -c.velocity.x;
    my = -c.velocity.y;
  }
  c.x += mx;
  c.y += my;
  if (mx) {
    // X軸方向へ反転
    c.velocity = Vector.scale(c.velocity, {
      x: -1 * c.restitution,
      y: 1
    });
  }
  if (my) {
    // Y軸方向へ反転
    c.velocity = Vector.scale(c.velocity, {
      x: 1,
      y: -1 * c.restitution
    });
  }
  return [c, r];
}

export function collidedWithLine(
  circle: Circle,
  line: Line.Line
): [Circle, Line.Line] {
  // 円と線の衝突
  const v0 = {
    x: line.x0 - circle.x + circle.velocity.x,
    y: line.y0 - circle.y + circle.velocity.y
  };
  const v1 = circle.velocity;
  const v2 = {
    x: line.x1 - line.x0,
    y: line.y1 - line.y0
  };
  const cv1v2 = Vector.cross(v1, v2);
  const t1 = Vector.cross(v0, v1) / cv1v2;
  const t2 = Vector.cross(v0, v2) / cv1v2;
  const crossed = 0 <= t1 && t1 <= 1 && (0 <= t2 && t2 <= 1);

  if (crossed) {
    circle.x += -circle.velocity.x;
    circle.y += -circle.velocity.y;
    const dot0 = Vector.dot(circle.velocity, line.normal); // 法線と速度の内積
    const vec0 = Vector.multiply(line.normal, -2 * dot0);
    circle.velocity = Vector.add(vec0, circle.velocity);
    circle.velocity = Vector.multiply(
      circle.velocity,
      line.restitution * circle.restitution
    );
  }
  return [circle, line];
}

export function collidedWithCircle(a: Circle, peer: Circle): [Circle, Circle] {
  // 円と円の衝突
  const d2 = (peer.x - a.x) ** 2 + (peer.y - a.y) ** 2;
  if (d2 >= (a.radius + peer.radius) ** 2) {
    return [a, peer];
  }
  const distance = Math.sqrt(d2) || 0.01;
  const overlap = a.radius + peer.radius - distance;
  const v = { x: a.x - peer.x, y: a.y - peer.y };
  const aNormUnit = Vector.multiply(v, 1 / distance); // 法線単位ベクトル１
  const bNormUnit = Vector.multiply(aNormUnit, -1); // 法線単位ベクトル２
  if (
    a.type === enums.BodyType.Dynamic &&
    peer.type === enums.BodyType.Static
  ) {
    a.x += aNormUnit.x * overlap;
    a.y += aNormUnit.y * overlap;
    const dot0 = Vector.dot(a.velocity, aNormUnit); // 法線と速度の内積
    const vec0 = Vector.multiply(aNormUnit, -2 * dot0);
    a.velocity = Vector.add(vec0, a.velocity);
    a.velocity = Vector.multiply(a.velocity, a.restitution);
    return [a, peer];
  } else if (
    peer.type === enums.BodyType.Dynamic &&
    a.type === enums.BodyType.Static
  ) {
    peer.x += bNormUnit.x * overlap;
    peer.y += bNormUnit.y * overlap;
    const dot1 = Vector.dot(peer.velocity, bNormUnit); // 法線と速度の内積
    const vec1 = Vector.multiply(bNormUnit, -2 * dot1);
    peer.velocity = Vector.add(vec1, peer.velocity);
    peer.velocity = Vector.multiply(peer.velocity, peer.restitution);
    return [a, peer];
  } else {
    a.x += (aNormUnit.x * overlap) / 2;
    a.y += (aNormUnit.y * overlap) / 2;
    peer.x += (bNormUnit.x * overlap) / 2;
    peer.y += (bNormUnit.y * overlap) / 2;
    const aTangUnit = { x: aNormUnit.y * -1, y: aNormUnit.x }; // 接線ベクトル１
    const bTangUnit = { x: bNormUnit.y * -1, y: bNormUnit.x }; // 接線ベクトル２
    const aNorm = Vector.multiply(aNormUnit, Vector.dot(aNormUnit, a.velocity)); // aベクトル法線成分
    const aTang = Vector.multiply(aTangUnit, Vector.dot(aTangUnit, a.velocity)); // aベクトル接線成分
    const bNorm = Vector.multiply(
      bNormUnit,
      Vector.dot(bNormUnit, peer.velocity)
    ); // bベクトル法線成分
    const bTang = Vector.multiply(
      bTangUnit,
      Vector.dot(bTangUnit, peer.velocity)
    ); // bベクトル接線成分
    a.velocity = { x: bNorm.x + aTang.x, y: bNorm.y + aTang.y };
    peer.velocity = { x: aNorm.x + bTang.x, y: aNorm.y + bTang.y };
    return [a, peer];
  }
}
