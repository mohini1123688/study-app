import Phaser from 'phaser';

// Day positions, following the calendar's actual grid (uneven row lengths,
// matching a real month layout — not a plain 6x5 grid).
const DAY_POSITIONS: { x: number; y: number }[] = [
  // Row 1 (5 days)
  { x: 23, y: 108 }, { x: 28, y: 108 }, { x: 33, y: 108 }, { x: 38, y: 108 }, { x: 43, y: 108 },
  // Row 2 (7 days)
  { x: 13, y: 113 }, { x: 18, y: 113 }, { x: 23, y: 113 }, { x: 28, y: 113 }, { x: 33, y: 113 }, { x: 38, y: 113 }, { x: 43, y: 113 },
  // Row 3 (7 days)
  { x: 13, y: 118 }, { x: 18, y: 118 }, { x: 23, y: 118 }, { x: 28, y: 118 }, { x: 33, y: 118 }, { x: 38, y: 118 }, { x: 43, y: 118 },
  // Row 4 (7 days)
  { x: 13, y: 123 }, { x: 18, y: 123 }, { x: 23, y: 123 }, { x: 28, y: 123 }, { x: 33, y: 123 }, { x: 38, y: 123 }, { x: 43, y: 123 },
  // Row 5 (4 days)
  { x: 13, y: 128 }, { x: 18, y: 128 }, { x: 23, y: 128 }, { x: 28, y: 128 },
];

// Maps a completed-task count to a fill-in frame (0 = none, up to 4 = most).
// TUNE these thresholds once you know what feels right.
function countToFrame(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4; // 4+
}

export function setupHeatmapCalendar(scene: Phaser.Scene) {
  const fillSprites: Phaser.GameObjects.Sprite[] = DAY_POSITIONS.map(pos => {
    const sprite = scene.add.sprite(pos.x, pos.y, 'heatmap_fill_in');
    sprite.setScale(4);
    sprite.setFrame(0);
    sprite.setDepth(1); // above the calendar background, TUNE if it sits at a different depth
    return sprite;
  });

  // For now: manually supply an array of 30 counts (index 0 = day 1, etc.)
  // to test how the heatmap looks, without needing real accumulated data yet.
  const setTestData = (counts: number[]) => {
    counts.forEach((count, index) => {
      const sprite = fillSprites[index];
      if (sprite) sprite.setFrame(countToFrame(count));
    });
  };

  const destroy = () => {
    fillSprites.forEach(sprite => sprite.destroy());
  };

  return { setTestData, destroy };
}