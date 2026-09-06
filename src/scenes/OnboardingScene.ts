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
          <select id="ob-school" style="
            width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
            box-sizing: border-box;
          ">
            <option value="">school (required)</option>
            <option value="artsci">Arts & Sciences</option>
            <option value="mckelvey">McKelvey (Engineering)</option>
            <option value="olin">Olin (Business)</option>
            <option value="samfox">Samfox (Art & Design)</option>
          </select>
          <input id="ob-major" type="text" placeholder="major (required)" style="
            width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
            box-sizing: border-box;
          " />
          <select id="ob-year" style="
            width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
            box-sizing: border-box;
          ">
            <option value="">year (required)</option>
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
      const schoolEl = document.getElementById('ob-school') as HTMLSelectElement;
      const majorEl = document.getElementById('ob-major') as HTMLInputElement;
      const yearEl = document.getElementById('ob-year') as HTMLSelectElement;
      const submitEl = document.getElementById('ob-submit') as HTMLButtonElement;

      submitEl.addEventListener('click', async () => {
        errorEl.textContent = '';
        const username = usernameEl.value.trim();
        const school = schoolEl.value;
        const major = majorEl.value.trim();
        const year = yearEl.value;

        if (!username) {
          errorEl.textContent = 'Username is required.';
          return;
        }

        if (username.length > 15) {
          errorEl.textContent = 'Username must be 15 characters or less.';
          return;
        }

        if (!school) {
          errorEl.textContent = 'School is required.';
          return;
        }

        if (!major) {
          errorEl.textContent = 'Major is required.';
          return;
        }

        if (!year) {
          errorEl.textContent = 'Year is required.';
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
          school,
          major,
          year,
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
        this.registry.set('username', username);
        this.scene.start('WelcomeScene');
      });
    };

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