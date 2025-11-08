import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._updateNavigation();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', isOpen);
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      })
    });

    // Logout functionality
    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.hash = '#/login';
        this._updateNavigation();
      });
    }
  }

  _updateNavigation() {
    const token = localStorage.getItem('authToken');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navLogout = document.getElementById('nav-logout');
    const navBookmark = document.getElementById('nav-bookmark');

    if (token) {
      if (navLogin) navLogin.style.display = 'none';
      if (navRegister) navRegister.style.display = 'none';
      if (navLogout) navLogout.style.display = 'block';
      if (navBookmark) navBookmark.style.display = 'block';
    } else {
      if (navLogin) navLogin.style.display = 'block';
      if (navRegister) navRegister.style.display = 'block';
      if (navLogout) navLogout.style.display = 'none';
      if (navBookmark) navBookmark.style.display = 'none';
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    this._updateNavigation();

    // Check if browser supports View Transition API
    if (document.startViewTransition) {
      // Use View Transition API
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      // Fallback for browsers that don't support View Transition API
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this._animateTransition();
    }
  }

  _animateTransition() {
    // Fade in animation
    this.#content.style.opacity = '0';
    this.#content.style.transform = 'translateY(10px)';
    
    // Trigger reflow
    void this.#content.offsetHeight;
    
    // Apply transition and fade in
    requestAnimationFrame(() => {
      this.#content.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
      this.#content.style.opacity = '1';
      this.#content.style.transform = 'translateY(0)';
    });
  }
}

export default App;
