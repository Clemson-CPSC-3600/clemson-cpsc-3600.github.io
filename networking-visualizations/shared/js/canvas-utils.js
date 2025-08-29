export function drawArrow(ctx, fromX, fromY, toX, toY, color = '#333') {
  const headLength = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

export function drawTextWithBackground(ctx, text, x, y, options = {}) {
  const {
    padding = 5,
    backgroundColor = 'rgba(255, 255, 255, 0.9)',
    textColor = 'black',
    font = '12px Arial'
  } = options;
  
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const textHeight = parseInt(font);
  
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    x - metrics.width / 2 - padding,
    y - textHeight / 2 - padding,
    metrics.width + padding * 2,
    textHeight + padding * 2
  );
  
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}