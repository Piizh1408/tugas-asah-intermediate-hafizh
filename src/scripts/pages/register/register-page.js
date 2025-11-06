export default class RegisterPage {
  async render() {
    return `
      <section class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Daftar ke StoryMap</h1>
          <p class="auth-subtitle">Bergabunglah untuk berbagi cerita perjalanan Anda.</p>
          
          <form id="register-form" class="auth-form" aria-label="Form pendaftaran">
            <div class="form-group">
              <label for="register-name" class="form-label">Nama</label>
              <input 
                type="text" 
                id="register-name" 
                name="name" 
                class="form-input" 
                placeholder="Nama lengkap"
                required
                aria-required="true"
                aria-describedby="register-name-error"
              >
              <span id="register-name-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="register-email" class="form-label">Email</label>
              <input 
                type="email" 
                id="register-email" 
                name="email" 
                class="form-input" 
                placeholder="nama@email.com"
                required
                aria-required="true"
                aria-describedby="register-email-error"
              >
              <span id="register-email-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="register-password" class="form-label">Kata Sandi</label>
              <input 
                type="password" 
                id="register-password" 
                name="password" 
                class="form-input" 
                placeholder="Minimal 8 karakter"
                required
                minlength="8"
                aria-required="true"
                aria-describedby="register-password-error"
              >
              <span id="register-password-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-block">
              <span class="btn-text">Daftar</span>
              <span class="btn-loader" style="display: none;">⏳</span>
            </button>

            <div id="register-error" class="error-message" role="alert" aria-live="polite"></div>
          </form>

          <p class="auth-footer">
            Sudah punya akun? 
            <a href="#/login" class="auth-link">Masuk sekarang</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById('register-form');
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      const errorDisplay = document.getElementById('register-error');
      const nameInput = document.getElementById('register-name');
      const emailInput = document.getElementById('register-email');
      const passwordInput = document.getElementById('register-password');
      
      // Reset errors
      errorDisplay.textContent = '';
      nameInput.setAttribute('aria-invalid', 'false');
      emailInput.setAttribute('aria-invalid', 'false');
      passwordInput.setAttribute('aria-invalid', 'false');
      
      // Validate password
      if (passwordInput.value.length < 8) {
        errorDisplay.textContent = 'Kata sandi harus minimal 8 karakter';
        errorDisplay.style.display = 'block';
        passwordInput.setAttribute('aria-invalid', 'true');
        return;
      }

      // Show loading
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(registerForm);
        const registerData = {
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
        };

        const response = await fetch('https://story-api.dicoding.dev/v1/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Registrasi gagal');
        }

        // Show success and redirect to login
        alert('Registrasi berhasil! Silakan login.');
        window.location.hash = '#/login';
        
      } catch (error) {
        errorDisplay.textContent = error.message;
        errorDisplay.style.display = 'block';
        emailInput.setAttribute('aria-invalid', 'true');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }
}

