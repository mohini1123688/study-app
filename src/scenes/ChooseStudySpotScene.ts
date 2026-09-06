import Phaser from 'phaser';
import { supabase } from '../supabaseClient';
import { setupFriendCountBadge } from './friendCountBadge';
import { setupBuildingSidebar } from './buildingSidebar';

export class ChooseStudySpotScene extends Phaser.Scene {
  constructor() {
    super('ChooseStudySpotScene');
  }
  preload() {
    this.load.aseprite('duc_hover', 'assets/duc_hover.png', 'assets/duc_hover.json');
    this.load.aseprite('olin_hover', 'assets/olin_hover.png', 'assets/olin_hover.json');
    this.load.aseprite('dorm_hover', 'assets/dorm_hover.png', 'assets/dorm_hover.json');
    this.load.image('map_only_grass', 'assets/map_only_grass.png');
    this.load.image('map_only_trees', 'assets/map_only_trees.png');
    this.load.aseprite('girl_player', 'assets/good_sprite_outline_girl.png', 'assets/good_sprite_outline_girl.json');
    this.load.aseprite('boy_player', 'assets/good_sprite_outline.png', 'assets/good_sprite_outline.json');
  }
  create() {
    const bg = this.add.image(104, 64, 'map_only_grass');
    bg.setOrigin(0.5);

    this.anims.createFromAseprite('duc_hover');
    this.anims.createFromAseprite('olin_hover');
    this.anims.createFromAseprite('dorm_hover');

    const chosenKey = this.registry.get('selectedCharacter');
    const player = this.add.sprite(196, 115, chosenKey);
    const animKey = chosenKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';
    player.play({ key: animKey, repeat: -1 });

    const duc = this.add.sprite(87, 57, 'duc_hover');
    duc.setInteractive({ useHandCursor: true });
    duc.on('pointerover', () => { duc.setFrame(1); });
    duc.on('pointerout', () => { duc.setFrame(0); });
    duc.on('pointerdown', () => { this.scene.start('BDScene'); });

    const olin = this.add.sprite(126, 47, 'olin_hover');
    olin.setInteractive({ useHandCursor: true });
    olin.on('pointerover', () => { olin.setFrame(1); });
    olin.on('pointerout', () => { olin.setFrame(0); });
    olin.on('pointerdown', () => {
      if (!currentUserId) return;
      sidebar.show('olin_room', currentUserId, 'OlinScene', 'Olin Library');
    });

    const dorm = this.add.sprite(54, 90, 'dorm_hover');
    dorm.setInteractive({ useHandCursor: true });
    dorm.on('pointerover', () => { dorm.setFrame(1); });
    dorm.on('pointerout', () => { dorm.setFrame(0); });
    dorm.on('pointerdown', () => { this.scene.start('DormScene'); });

    const trees = this.add.image(104, 64, 'map_only_trees');
    trees.setOrigin(0.5);

    let olinBadge: { destroy: () => void } | null = null;

    const sidebar = setupBuildingSidebar(this);
    let currentUserId: string | null = null;

    supabase.auth.getUser().then(({ data }) => {
      currentUserId = data.user?.id ?? null;
      console.log('[MAP CHECK] user=', currentUserId);

    });

    supabase.auth.getUser().then(({ data: userData }) => {
      const user = userData.user;
      if (!user) return;

      // TUNE — offset above the olin hotspot so the badge doesn't sit directly on top of it
      setupFriendCountBadge(this, 126, 40, 'olin_room', user.id).then((badge) => {
        olinBadge = badge;
      });

      // BD and Dorm rooms don't exist server-side yet — add these once those rooms are built:
      // setupFriendCountBadge(this, 87, 50, 'bd_room', user.id).then((badge) => { ducBadge = badge; });
      // setupFriendCountBadge(this, 54, 83, 'dorm_room', user.id).then((badge) => { dormBadge = badge; });
    });

    this.events.once('shutdown', () => {
      olinBadge?.destroy();
      sidebar.destroy();
    });
  }
}