import Phaser from 'phaser';
import { supabase } from '../supabaseClient';

type AuthResult = {
  isNewUser: boolean;
};

export function setupAuthOverlay(_scene: Phaser.Scene, onSuccess: (result: AuthResult) => void) {
  const overlayEl = document.getElementById('auth-overlay') as HTMLDivElement;
  let mode: 'login' | 'signup' = 'login';

  const render = () => {
    overlayEl.innerHTML = `
      <div style="
        background: white;
        border: 2px solid black;
        padding: 16px;
        width: 200px;
        font-family: 'VT323', monospace;
      ">
        <h2 style="margin: 0 0 12px; font-size: 18px; text-align: center;">
          ${mode === 'login' ? 'Log In' : 'Sign Up'}
        </h2>
        <input id="auth-email" type="email" placeholder="email" style="
          width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
          box-sizing: border-box;
        " />
        <input id="auth-password" type="password" placeholder="password" style="
          width: 100%; margin-bottom: 8px; padding: 4px; font-family: inherit; font-size: 14px;
          box-sizing: border-box;
        " />
        <div id="auth-error" style="color: red; font-size: 12px; min-height: 16px; margin-bottom: 8px;"></div>
        <button id="auth-submit" style="
          width: 100%; padding: 6px; font-family: inherit; font-size: 14px; cursor: pointer;
        ">${mode === 'login' ? 'Log In' : 'Sign Up'}</button>
        <div style="text-align: center; margin-top: 8px; font-size: 12px;">
          ${mode === 'login'
            ? `Don't have an account? <span id="auth-toggle" style="text-decoration: underline; cursor: pointer;">Sign up</span>`
            : `Already have an account? <span id="auth-toggle" style="text-decoration: underline; cursor: pointer;">Log in</span>`
          }
        </div>
      </div>
    `;

    const errorEl = document.getElementById('auth-error') as HTMLDivElement;
    const emailEl = document.getElementById('auth-email') as HTMLInputElement;
    const passwordEl = document.getElementById('auth-password') as HTMLInputElement;
    const submitEl = document.getElementById('auth-submit') as HTMLButtonElement;
    const toggleEl = document.getElementById('auth-toggle') as HTMLSpanElement;

    toggleEl.addEventListener('click', () => {
      mode = mode === 'login' ? 'signup' : 'login';
      render();
    });

    submitEl.addEventListener('click', async () => {
      errorEl.textContent = '';
      const email = emailEl.value.trim();
      const password = passwordEl.value;

      if (!email || !password) {
        errorEl.textContent = 'Please fill in both fields.';
        return;
      }

      submitEl.disabled = true;
      submitEl.textContent = mode === 'login' ? 'Logging in...' : 'Signing up...';

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        submitEl.disabled = false;
        submitEl.textContent = 'Log In';

        if (error) {
          errorEl.textContent = error.message;
          return;
        }

        hide();
        onSuccess({ isNewUser: false });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        submitEl.disabled = false;
        submitEl.textContent = 'Sign Up';

        if (error) {
          errorEl.textContent = error.message;
          return;
        }

        hide();
        onSuccess({ isNewUser: true });
      }
    });
  };

  const positionOverlay = () => {
    // Centered on screen, not tied to a specific world coordinate like other overlays
    overlayEl.style.left = '390px';
    overlayEl.style.top = '150px';
    overlayEl.style.transform = 'none';
    overlayEl.style.display = 'block';
  };

  const show = () => {
    render();
    positionOverlay();
  };

  const hide = () => {
    overlayEl.style.display = 'none';
    overlayEl.innerHTML = '';
  };

  // Check session on setup — only show the popup if nobody's logged in.
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      onSuccess({ isNewUser: false }); // already logged in, skip the popup entirely
    } else {
      show();
    }
  });

  const destroy = () => {
    hide();
  };

  return { destroy };
}