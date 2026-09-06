import Phaser from 'phaser';
import { supabase } from '../supabaseClient';
import { setupAuthOverlay } from './authOverlay';
import { setupFriendsPopup } from './friendsPopup';
import { setupHeatmapCalendar } from './heatmapCalendar';
import { setupProfilePopup } from './profilePopup';


export class WelcomeScene extends Phaser.Scene {
  constructor() {
    super('WelcomeScene');
  }
  preload() {
    this.load.aseprite('washu', 'assets/welcom_page_no_button.png', 'assets/welcom_page_no_button.json');
    this.load.aseprite('start_btn', 'assets/start_button.png', 'assets/start_button.json');
    this.load.aseprite('log_in_menu', 'assets/log_in_menu.png', 'assets/log_in_menu.json');
    this.load.aseprite('log_in_submit_button.png', 'assets/log_in_submit_button.png', 'assets/log_in_submit_button.json');
    this.load.image('heatmap_calendar', 'assets/heatmap_calendar.png');
    this.load.aseprite('new_friends_button', 'assets/new_friends_button.png', 'assets/new_friends_button.json');
    this.load.aseprite('heatmap_fill_in', 'assets/heatmap_fill_in.png', 'assets/heatmap_fill_in.json');
    this.load.image('log_out_button', 'assets/log_out_button.png');
    this.load.image('profile_button', 'assets/profile_button.png');
    this.load.image('profile_pop_up', 'assets/profile_pop_up.png');
    this.load.aseprite('girl_player', 'assets/good_sprite_outline_girl.png', 'assets/good_sprite_outline_girl.json')
  }
  create() {
  let isLoggedIn = false;

supabase.auth.getSession().then(({ data }) => {
  if (data.session) {
    isLoggedIn = true;
  }
});

const friendsPopup = setupFriendsPopup(this);

const authOverlay = setupAuthOverlay(this, ({ isNewUser }) => {
  isLoggedIn = true; // <-- add this — login/signup just succeeded, so this is now definitely true

  if (isNewUser) {
    this.scene.start('OnboardingScene');
  }
});
  this.anims.createFromAseprite('washu');
  const bg = this.add.sprite(104, 64, 'washu');
  bg.setOrigin(0.5);

  bg.play({ key: 'intro', repeat: -1, frameRate: 6 });

  const logoutButton = this.add.image(10,10, 'log_out_button').setInteractive({ useHandCursor: true });

logoutButton.on('pointerdown', async () => {
  await supabase.auth.signOut();
  this.registry.remove('username'); // clear stale cache so the next account doesn't inherit it
  window.location.reload();
});

const friendsButton = this.add.sprite(197, 10, 'new_friends_button');
friendsButton.setInteractive({ useHandCursor: true });

friendsButton.on('pointerover', () => {
    friendsButton.setFrame(1);
  });

  friendsButton.on('pointerout', () => {
    friendsButton.setFrame(0);
  });

friendsButton.on('pointerdown', () => {
    if (!isLoggedIn) return;
    friendsPopup.show();
  });


  const startButton = this.add.sprite(104, 15, 'start_btn', 0); // 0 = starting frame index
  startButton.setInteractive({ useHandCursor: true });

  startButton.on('pointerover', () => {
    startButton.setFrame(1);
  });

  startButton.on('pointerout', () => {
    startButton.setFrame(0);
  });

  startButton.on('pointerdown', () => {
    this.scene.start('CharacterCustomizeScene');
  });

  const profilePopup = setupProfilePopup(this);
  const profileButton = this.add.image(23,10, 'profile_button');
  profileButton.setInteractive({ useHandCursor: true });
  profileButton.on('pointerdown', async () => {
  const { data } = await supabase.auth.getUser();
  if (data.user) profilePopup.showProfile(data.user.id);
});

  const heatmap_calendar = this.add.image(22, 108, 'heatmap_calendar');
  const heatmap = setupHeatmapCalendar(this);

const loadRealHeatmapData = async () => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = startOfMonth.toISOString().split('T')[0];

  const { data } = await supabase
    .from('daily_completions')
    .select('date, count')
    .eq('user_id', user.id)
    .gte('date', endDate);

  const counts = new Array(30).fill(0);
  (data ?? []).forEach(row => {
    const day = parseInt(row.date.split('-')[2], 10); // fixes the timezone bug from before
    if (day >= 1 && day <= 30) {
      counts[day - 1] = row.count;
    }
  });

  heatmap.setTestData(counts);
};

loadRealHeatmapData();

this.events.once('shutdown', () => {
  authOverlay.destroy();
  friendsPopup.destroy();
  heatmap.destroy();
  profilePopup.destroy();

});
}

}