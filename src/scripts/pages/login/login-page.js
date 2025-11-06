export default class LoginPage {
  async render() {
    return `
      <section class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Masuk ke StoryMap</h1>
          <p class="auth-subtitle">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
          
          <form id="login-form" class="auth-form" aria-label="Form login">
            <div class="form-group">
              <label for="login-email" class="form-label">Email</label>
              <input 
                type="email" 
                id="login-email" 
                name="email" 
                class="form-input" 
                placeholder="nama@email.com"
                required
                aria-required="true"
                aria-describedby="login-email-error"
              >
              <span id="login-email-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="login-password" class="form-label">Kata Sandi</label>
              <input 
                type="password" 
                id="login-password" 
                name="password" 
                class="form-input" 
                placeholder="Masukkan kata sandi"
                required
                aria-required="true"
                aria-describedby="login-password-error"
              >
              <span id="login-password-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-block">
              <span class="btn-text">Masuk</span>
              <span class="btn-loader" style="display: none;">⏳</span>
            </button>

            <div id="login-error" class="error-message" role="alert" aria-live="polite"></div>
          </form>

          <p class="auth-footer">
            Belum punya akun? 
            <a href="#/register" class="auth-link">Daftar sekarang</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      const errorDisplay = document.getElementById('login-error');
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      
      // Reset errors
      errorDisplay.textContent = '';
      emailInput.setAttribute('aria-invalid', 'false');
      passwordInput.setAttribute('aria-invalid', 'false');
      
      // Show loading
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(loginForm);
        const loginData = {
          email: formData.get('email'),
          password: formData.get('password'),
        };

        const response = await fetch('https://story-api.dicoding.dev/v1/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Login gagal');
        }

        // Save token
        localStorage.setItem('authToken', result.loginResult.token);
        localStorage.setItem('userName', result.loginResult.name);
        localStorage.setItem('userEmail', result.loginResult.email);

        // Redirect to home
        window.location.hash = '#/';
        this._animateTransition();
        
      } catch (error) {
        errorDisplay.textContent = error.message;
        errorDisplay.style.display = 'block';
        emailInput.setAttribute('aria-invalid', 'true');
        passwordInput.setAttribute('aria-invalid', 'true');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }

  _animateTransition() {
    const mainContent = document.querySelector('#main-content');
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(20px)';
  }
}

