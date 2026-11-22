export type Point = readonly [number, number];

/** 三次贝塞尔曲线上 t 处的点 */
export const bezierPoint = (t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};

/** 水平方向的 S 形曲线控制点：从 a 水平出发，水平进入 b */
export const horizontalCurve = (a: Point, b: Point, bend = 0.5): [Point, Point, Point, Point] => {
  const dx = (b[0] - a[0]) * bend;
  return [a, [a[0] + dx, a[1]], [b[0] - dx, b[1]], b];
};

/** 曲线 → SVG path d */
export const curvePath = ([p0, p1, p2, p3]: readonly [Point, Point, Point, Point]): string =>
  `M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;
