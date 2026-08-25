import Phaser from 'phaser';

const COLON_FRAME = 10; // the 11th frame in your numbers spritesheet (0-9 = digits, 10 = colon)

export function setupTimerDisplay(scene: Phaser.Scene, x: number, y: number) {
  // TUNE — distance in world units between each element. Increasing this
  // spreads the digits/colon further apart; decreasing pulls them closer together.
  const digitSpacing = 4;

  const minuteTens = scene.add.sprite(x, y, 'numbers');
  const minuteOnes = scene.add.sprite(x + digitSpacing, y, 'numbers');
  const colon = scene.add.sprite(x + digitSpacing * 2, y, 'numbers');
  const secondTens = scene.add.sprite(x + digitSpacing * 3, y, 'numbers');
  const secondOnes = scene.add.sprite(x + digitSpacing * 4, y, 'numbers');

  colon.setFrame(COLON_FRAME); // static — never changes

  // Sets all four digits from a total seconds count (e.g. 1500 -> "25:00")
  const updateDigits = (totalSeconds: number) => {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;

    minuteTens.setFrame(Math.floor(minutes / 10) % 10);
    minuteOnes.setFrame(minutes % 10);
    secondTens.setFrame(Math.floor(seconds / 10) % 10);
    secondOnes.setFrame(seconds % 10);
  };

  const setVisible = (visible: boolean) => {
    minuteTens.setVisible(visible);
    minuteOnes.setVisible(visible);
    colon.setVisible(visible);
    secondTens.setVisible(visible);
    secondOnes.setVisible(visible);
  };

  setVisible(false);

  return { updateDigits, setVisible };
}

// Picked-time display — shows "MM:00" (e.g. "25:00") before a session starts.
// Minutes are dynamic (whichever button was picked); seconds are always "00"
// since the session hasn't started counting down yet.
export function setupPickedTimeDisplay(scene: Phaser.Scene, x: number, y: number) {
  const digitSpacing = 4; // TUNE — same convention as above

  const minuteTens = scene.add.sprite(x, y, 'numbers');
  const minuteOnes = scene.add.sprite(x + digitSpacing, y, 'numbers');
  const colon = scene.add.sprite(x + digitSpacing * 2, y, 'numbers');
  const secondTens = scene.add.sprite(x + digitSpacing * 3, y, 'numbers');
  const secondOnes = scene.add.sprite(x + digitSpacing * 4, y, 'numbers');

  colon.setFrame(COLON_FRAME);
  secondTens.setFrame(0); // always "00" seconds
  secondOnes.setFrame(0);

  const setNumber = (minutes: number) => {
    const clamped = Math.max(0, Math.min(99, Math.floor(minutes)));
    minuteTens.setFrame(Math.floor(clamped / 10));
    minuteOnes.setFrame(clamped % 10);
  };

  const setVisible = (visible: boolean) => {
    minuteTens.setVisible(visible);
    minuteOnes.setVisible(visible);
    colon.setVisible(visible);
    secondTens.setVisible(visible);
    secondOnes.setVisible(visible);
  };

  setVisible(false);

  return { setNumber, setVisible };
}