import Phaser from 'phaser';
import { supabase } from '../supabaseClient';

export class OnboardingScene extends Phaser.Scene {
  constructor() {
    super('OnboardingScene');
  }

  create() {
    const overlayEl = document.getElementById('auth-overlay') as HTMLDivElement;

    const render = () => {
      overlayEl.innerHTML = `
        <div style="
          background: white;
          border: 2px solid black;
          padding: 16px;
          width: 220px;
          font-family: 'VT323', monospace;
        ">
          <h2 style="margin: 0 0 12px; font-size: 18px; text-align: center;">Set up your profile</h2>

          <input id="ob-username" type="text" placeholder="username (required)" maxlength="15" style="
            width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
            box-sizing: border-box;
          " />
          <input id="ob-displayname" type="text" placeholder="display name (optional)" style="
            width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
            box-sizing: border-box;
          " />
          <select id="ob-major" style="
  width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
  box-sizing: border-box;
">
  <option value="">school (optional)</option>
  <option value="artsci">Arts & Sciences</option>
  <option value="mckelvey">McKelvey (Engineering)</option>
  <option value="olin">Olin (Business)</option>
  <option value="samfox">Samfox (Art & Design)</option>
</select>

<select id="ob-year" style="
  width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
  box-sizing: border-box;
">
  <option value="">year (optional)</option>
  <option value="2027">2027</option>
  <option value="2028">2028</option>
  <option value="2029">2029</option>
  <option value="2030">2030</option>
</select>

          <div id="ob-error" style="color: red; font-size: 12px; min-height: 16px; margin-bottom: 8px;"></div>

          <button id="ob-submit" style="
            width: 100%; padding: 6px; font-family: inherit; font-size: 14px; cursor: pointer;
          ">Continue</button>
        </div>
      `;

      const errorEl = document.getElementById('ob-error') as HTMLDivElement;
const usernameEl = document.getElementById('ob-username') as HTMLInputElement;
const displayNameEl = document.getElementById('ob-displayname') as HTMLInputElement;
const majorEl = document.getElementById('ob-major') as HTMLSelectElement;
const yearEl = document.getElementById('ob-year') as HTMLSelectElement;
const submitEl = document.getElementById('ob-submit') as HTMLButtonElement;

submitEl.addEventListener('click', async () => {

  errorEl.textContent = '';
  const username = usernameEl.value.trim();

  if (!username) {
    errorEl.textContent = 'Username is required.';
    return;
  }

  submitEl.disabled = true;
  submitEl.textContent = 'Saving...';

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    errorEl.textContent = 'Something went wrong — please try logging in again.';
    submitEl.disabled = false;
    submitEl.textContent = 'Continue';
    return;
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    username,
    display_name: displayNameEl.value.trim() || null,
    major: majorEl.value || null,
    year: yearEl.value || null,
  });

  submitEl.disabled = false;
  submitEl.textContent = 'Continue';

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      errorEl.textContent = 'That username is already taken.';
    } else {
      errorEl.textContent = error.message;
    }
    return;
  }

  overlayEl.style.display = 'none';
  overlayEl.innerHTML = '';
  this.registry.set('username', username); // cache immediately after signup, skip the first fetch too
  this.scene.start('WelcomeScene');

if (!username) {
  errorEl.textContent = 'Username is required.';
  return;
}

if (username.length > 15) {
  errorEl.textContent = 'Username must be 15 characters or less.';
  return;
}
});
    }
    render();
    overlayEl.style.left = '325px';
    overlayEl.style.top = '200px';
    overlayEl.style.transform = 'translate(-50%, -50%)';
    overlayEl.style.display = 'block';

    this.events.once('shutdown', () => {
      overlayEl.style.display = 'none';
      overlayEl.innerHTML = '';
    });
  }
}