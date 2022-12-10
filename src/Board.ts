import { IDrawProperties, ILineCache, IMouseProperties } from "./types";

export class Board {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mouse: IMouseProperties;
  private cachedLines: Array<ILineCache> = [];
  private drawProperties: IDrawProperties;
  private bounding: DOMRect;

  constructor(public width: number, public height: number) {
    this.width = width;
    this.height = height;
    this.mouse = { x: 0, y: 0, down: false };
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") || new CanvasRenderingContext2D();
    this.bounding = this.canvas.getBoundingClientRect();
    this.drawProperties = {
      color: "white",
      width: 4,
      shadowBlur: 5,
      shadowColor: "rgba(255, 255, 255, 0.3)",
      mode: "pen",
    };
  }

  public init() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    document.getElementById("app")?.appendChild(this.canvas);

    this.bounding = this.canvas.getBoundingClientRect();

    // on desktop browsers
    this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
    this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));

    // on mobile touch screen
    this.canvas.addEventListener("touchstart", this.mouseDown.bind(this));
    this.canvas.addEventListener("touchend", this.mouseUp.bind(this));
    this.canvas.addEventListener("touchmove", this.mouseMove.bind(this));
  }

  private mouseMove(event: MouseEvent | TouchEvent) {
    if (this.mouse.down) {
      this.draw(event);
    }
  }

  private updateCursor(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      this.mouse.x = event.offsetX;
      this.mouse.y = event.offsetY;
    }
    if (event instanceof TouchEvent) {
      this.mouse.x = event.touches[0]?.pageX - this.bounding.left;
      this.mouse.y = event.touches[0]?.pageY - this.bounding.top;
    }
  }

  private mouseDown(event: MouseEvent | TouchEvent) {
    this.mouse.down = true;
    this.updateCursor(event);

    this.cachedLines.push([
      {
        x: this.mouse.x,
        y: this.mouse.y,
        width: this.drawProperties.width,
        shadowBlur: this.drawProperties.shadowBlur,
        color: this.drawProperties.color,
        shadowColor: this.drawProperties.shadowColor,
        mode: this.drawProperties.mode,
      },
    ]);
  }

  private mouseUp(event: MouseEvent | TouchEvent) {
    this.mouse.down = false;
    this.updateCursor(event);
  }

  private drawLine(event: MouseEvent | TouchEvent) {
    this.cachedLines[this.cachedLines.length - 1].push({
      x: this.mouse.x,
      y: this.mouse.y,
      width: this.drawProperties.width,
      shadowBlur: this.drawProperties.shadowBlur,
      color: this.drawProperties.color,
      shadowColor: this.drawProperties.shadowColor,
      mode: this.drawProperties.mode,
    });
    const ptx = this.mouse.x;
    const pty = this.mouse.y;
    this.updateCursor(event);
    this.ctx.bezierCurveTo(
      ptx,
      pty,
      (ptx + this.mouse.x) / 2,
      (pty + this.mouse.y) / 2,
      this.mouse.x,
      this.mouse.y,
    );
  }

  private drawPyramid = (event: MouseEvent | TouchEvent) => {
    this.ctx.beginPath();

    this.ctx.moveTo(this.mouse.x, this.mouse.y);
    if (event instanceof MouseEvent) {
      this.ctx.lineTo(event.offsetX, event.offsetY);
      this.cachedLines[this.cachedLines.length - 1].push({
        x: event.offsetX,
        y: event.offsetY,
        width: this.drawProperties.width,
        shadowBlur: this.drawProperties.shadowBlur,

        color: this.drawProperties.color,
        shadowColor: this.drawProperties.shadowColor,
        mode: this.drawProperties.mode,
      });
    } else if (event instanceof TouchEvent)
      this.ctx.lineTo(
        event.touches[0]?.pageX - this.bounding.left,
        event.touches[0]?.pageY - this.bounding.top,
      );
    if (event instanceof MouseEvent) {
      this.ctx.lineTo(this.mouse.x * 2 - event.offsetX, event.offsetY);
      this.cachedLines[this.cachedLines.length - 1].push({
        x: this.mouse.x * 2 - event.offsetX,
        y: event.offsetY,
        width: this.drawProperties.width,
        shadowBlur: this.drawProperties.shadowBlur,
        color: this.drawProperties.color,
        shadowColor: this.drawProperties.shadowColor,
        mode: this.drawProperties.mode,
      });
    } else if (event instanceof TouchEvent) {
      this.ctx.lineTo(
        this.mouse.x * 2 - event.touches[0]?.pageX + this.bounding.left,
        event.touches[0]?.pageY - this.bounding.top,
      );
      this.cachedLines[this.cachedLines.length - 1].push({
        x: this.mouse.x * 2 - event.touches[0]?.pageX + this.bounding.left,
        y: event.touches[0]?.pageY - this.bounding.top,
        width: this.drawProperties.width,
        shadowBlur: this.drawProperties.shadowBlur,
        color: this.drawProperties.color,
        shadowColor: this.drawProperties.shadowColor,
        mode: this.drawProperties.mode,
      });
    }
    this.ctx.closePath();
  };

  public undoLastLine() {
    if (this.cachedLines.length === 0) return;
    this.cachedLines.pop();
    this.clear();
    this.drawCachedLines();
  }

  public draw(event: MouseEvent | TouchEvent) {
    if (!this.mouse.down) return;
    this.ctx.beginPath();
    switch (this.drawProperties.mode) {
      case "pen":
        this.drawLine(event);
        break;
      case "pyramid":
        this.drawPyramid(event);
        break;
      default:
        this.drawLine(event);
        break;
    }
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.strokeStyle =
      this.drawProperties.mode === "eraser"
        ? "#333"
        : this.drawProperties.color;
    this.ctx.shadowColor = this.drawProperties.shadowColor;
    this.ctx.shadowBlur =
      this.drawProperties.mode === "eraser"
        ? 0
        : this.drawProperties.shadowBlur;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = this.drawProperties.width;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private drawCachedLines() {
    for (let i = 0; i < this.cachedLines.length; ++i) {
      for (let j = 0; j < this.cachedLines[i].length; ++j) {
        const line = this.cachedLines[i];
        this.ctx.beginPath();
        this.ctx.bezierCurveTo(
          line[j]?.x,
          line[j]?.y,
          (line[j]?.x + line[j + 1]?.x) / 2,
          (line[j]?.y + line[j + 1]?.y) / 2,
          line[j + 1]?.x,
          line[j + 1]?.y,
        );
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.strokeStyle = line[i]?.color;
        this.ctx.shadowColor = line[i]?.shadowColor;
        this.ctx.shadowBlur = line[i]?.shadowBlur;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = line[i]?.width;
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  }

  public saveCanvas(): void {
    // prompt input to ask for name
    const name = prompt("Enter a name for your drawing");
    if (!name) return;

    // Extract canvas dataURL to an image
    const dataURL = this.canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = name + ".png";
    link.href = dataURL;
    link.click();
  }

  public clear(clearCache?: boolean): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    clearCache ? (this.cachedLines = []) : null;
  }

  public setWidth(width: number) {
    this.drawProperties.width = width;
  }

  public setColor(color: string) {
    this.drawProperties.color = color;
  }

  public setMode(mode: string) {
    this.drawProperties.mode = mode;
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.bounding = this.canvas.getBoundingClientRect();
    this.drawCachedLines();
  }
}
