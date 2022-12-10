import { Board } from "./Board";

const undoBtn = document.getElementById("undo") as HTMLButtonElement;
const sizeBtns = document.querySelectorAll(
  "#size",
) as NodeListOf<HTMLButtonElement>;
const colorPicker = document.getElementById("color") as HTMLInputElement;
const modeSelectors = document.querySelectorAll(
  "#mode",
) as NodeListOf<HTMLInputElement>;
const clearBtn = document.getElementById("clear") as HTMLButtonElement;
const saveBtn = document.getElementById("save") as HTMLButtonElement;
const board = new Board(window.innerWidth / 1.2, window.innerHeight / 1.1);

const undo = () => board.undoLastLine();
const changeColor = (color: string) => board.setColor(color);
const changeSize = (size: number) => board.setWidth(size);
const changeMode = (mode: string) => board.setMode(mode);
const clearBoard = () => board.clear(true);
const saveBoard = () => board.saveCanvas();
const resizeBoard = (width: number, height: number) =>
  board.resize(width, height);

undoBtn.addEventListener("click", undo);
sizeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    changeSize(parseInt(btn.dataset.size || "4"));
    sizeBtns.forEach((btn) => btn.classList.remove("selected"));
    btn.classList.add("selected");
  });
});
colorPicker.addEventListener("input", () => {
  changeColor(colorPicker.value);
});
modeSelectors.forEach((selector) => {
  selector.addEventListener("click", () => {
    changeMode(selector.dataset.mode || "pen");
    modeSelectors.forEach((btn) => btn.classList.remove("selected"));
    selector.classList.add("selected");
  });
});
clearBtn.addEventListener("click", clearBoard);
saveBtn.addEventListener("click", saveBoard);
window.addEventListener("resize", () => {
  resizeBoard(window.innerWidth / 1.2, window.innerHeight / 1.1);
});

// undo on ctrl + z click
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    undo();
  }
});

board.init();
