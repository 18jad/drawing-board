interface IMouseProperties {
  x: number;
  y: number;
  down: boolean;
}

interface IDrawProperties {
  color: string;
  width: number;
  shadowBlur: number;
  shadowColor: string;
  mode: string;
}

interface ILineCoordinates extends IDrawProperties {
  x: number;
  y: number;
}

type ILineCache = ILineCoordinates[];

export type { IMouseProperties, IDrawProperties, ILineCache };
