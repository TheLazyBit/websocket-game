import batUrl from "../images/bats.png";
const batImage = new Image();
batImage.src = batUrl;

export type TBat = {
  x: number;
  y: number;
  startY: number;
  animation: number;
  onRemove: (bat: TBat) => void;
};

const BAT_FRAME_SIZE = 32;
const BAT_ANIMATION_RATE = 100;
const TOTAL_FRAMES = 4;
const BAT_SPEED = 3.0;

export function updateBat(bat: TBat, delta: number) {
  bat.animation += delta;
  bat.x += BAT_SPEED;
  bat.y = Math.sin(bat.animation / 1000) * 50 + bat.startY;

  if (bat.x > 5000) {
    bat.onRemove(bat);
  }
}

export function getSpriteFrameLocation(bat: TBat) {
  const id = Math.floor(bat.animation / BAT_ANIMATION_RATE) % TOTAL_FRAMES;
  const cols = batImage.width / BAT_FRAME_SIZE;
  const x = (id % cols) * BAT_FRAME_SIZE;
  const y = 0;
  return {
    x,
    y,
  };
}

export function drawBat(
  bat: TBat,
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number
) {
  const frameLocation = getSpriteFrameLocation(bat);
  ctx.drawImage(
    batImage,
    frameLocation.x,
    frameLocation.y,
    BAT_FRAME_SIZE,
    BAT_FRAME_SIZE,
    bat.x - cx,
    bat.y - cy,
    BAT_FRAME_SIZE,
    BAT_FRAME_SIZE
  );
}

export function createBat(mapHeight: number, onRemove: (bat: TBat) => void) {
  const bat: TBat = {
    x: -500,
    y: 0,
    startY: Math.random() * mapHeight - 1000,
    animation: 0,
    onRemove,
  };

  return bat;
}
