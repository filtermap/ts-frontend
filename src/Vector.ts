export type Vector = {
  x: number;
  y: number;
};

export function add(a: Vector, b: Vector): Vector {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

export function multiply(a: Vector, n: number): Vector {
  return {
    x: a.x * n,
    y: a.y * n
  };
}

export function scale(a: Vector, b: Vector): Vector {
  return {
    x: a.x * b.x,
    y: a.y * b.y
  };
}

export function dot(a: Vector, b: Vector): number {
  return a.x * b.x + a.y * b.y;
}

export function cross(a: Vector, b: Vector): number {
  return a.x * b.y - b.x * a.y;
}
