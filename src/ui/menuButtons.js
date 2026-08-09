import { PIXEL_FONT } from './fonts.js';

export function createMenuButton(scene, x, y, label, options = {}) {
  const {
    fontSize = '14px',
    color = '#e8eef5',
    backgroundColor = '#243447',
    hoverColor = '#314a63',
    padding = { x: 16, y: 10 },
    origin = 0.5,
  } = options;

  const button = scene.add
    .text(x, y, label, {
      fontFamily: PIXEL_FONT,
      fontSize,
      color,
      backgroundColor,
      padding,
    })
    .setOrigin(origin)
    .setInteractive({ useHandCursor: true });

  button.on('pointerover', () => button.setStyle({ backgroundColor: hoverColor }));
  button.on('pointerout', () => button.setStyle({ backgroundColor }));

  return button;
}
