import Phaser from 'phaser';

export function setupStudyItems(
  scene: Phaser.Scene,
  player: Phaser.GameObjects.Sprite,
  sendStudyItem?: (item: 'none' | 'paper' | 'laptop' | 'book') => void
) {
  const paper_and_pencil = scene.add.image(65, 45, 'paper_and_pencil');
  paper_and_pencil.setDepth(2);
  const laptop = scene.add.image(64, 46, 'laptop');
  laptop.setDepth(2);
  const book = scene.add.image(64, 46, 'book');
  book.setDepth(2);

  paper_and_pencil.setVisible(false);
  laptop.setVisible(false);
  book.setVisible(false);

  const studyItems = [paper_and_pencil, laptop, book];

  const itemKeyMap = new Map<Phaser.GameObjects.Image, 'paper' | 'laptop' | 'book'>([
    [paper_and_pencil, 'paper'],
    [laptop, 'laptop'],
    [book, 'book'],
  ]);

  const hideAll = () => {
    studyItems.forEach(item => item.setVisible(false));
    sendStudyItem?.('none');
  };

  const showRandom = () => {
    hideAll();
    const randomItem = Phaser.Utils.Array.GetRandom(studyItems);
    randomItem.setPosition(player.x, player.y + 11);
    randomItem.setVisible(true);
    const itemName = itemKeyMap.get(randomItem)!;
    sendStudyItem?.(itemName);
  };

  return { hideAll, showRandom };
}