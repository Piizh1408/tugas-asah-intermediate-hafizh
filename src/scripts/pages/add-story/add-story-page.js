import { addStory } from '../../data/api.js';
import 'leaflet/dist/leaflet.css';

export default class AddStoryPage {
  async render() {
    return `
      <section class="form-container">
        <div class="form-card">
          <h1 class="form-title">➕ Tambah Cerita Baru</h1>
          <p class="form-subtitle">Bagikan pengalaman perjalanan Anda dengan yang lain</p>
          
          <form id="add-story-form" class="story-form" aria-label="Form tambah cerita">
            <div class="form-group">
              <label for="story-name" class="form-label">Judul Cerita</label>
              <input 
                type="text" 
                id="story-name" 
                name="name" 
                class="form-input" 
                placeholder="Contoh: Eksplorasi Gunung Bromo"
                required
                aria-required="true"
                aria-describedby="story-name-error story-name-help"
              >
              <small id="story-name-help" class="form-help">Berikan judul yang menarik untuk cerita Anda</small>
              <span id="story-name-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="story-description" class="form-label">Deskripsi</label>
              <textarea 
                id="story-description" 
                name="description" 
                class="form-textarea" 
                rows="5"
                placeholder="Ceritakan pengalaman Anda di tempat ini..."
                required
                aria-required="true"
                aria-describedby="story-description-error story-description-help"
              ></textarea>
              <small id="story-description-help" class="form-help">Minimal 10 karakter</small>
              <span id="story-description-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label class="form-label">📍 Pilih Lokasi di Peta</label>
              <div id="story-map" style="height: 350px; width: 100%; border-radius: 8px; margin-top: 10px; border: 2px solid #e5e7eb;"></div>
              <small class="form-help">Klik pada peta untuk memilih koordinat Latitude dan Longitude</small>
              <span id="story-map-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="story-lat" class="form-label">Latitude</label>
              <input 
                type="number" 
                id="story-lat" 
                name="lat" 
                class="form-input" 
                step="any"
                placeholder="-7.2575"
                required
                aria-required="true"
                aria-describedby="story-lat-error story-lat-help"
                readonly
              >
              <small id="story-lat-help" class="form-help">Koordinat akan terisi otomatis saat klik peta</small>
              <span id="story-lat-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="story-lon" class="form-label">Longitude</label>
              <input 
                type="number" 
                id="story-lon" 
                name="lon" 
                class="form-input" 
                step="any"
                placeholder="112.7521"
                required
                aria-required="true"
                aria-describedby="story-lon-error story-lon-help"
                readonly
              >
              <small id="story-lon-help" class="form-help">Koordinat akan terisi otomatis saat klik peta</small>
              <span id="story-lon-error" class="error-message" role="alert" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="story-photo" class="form-label">Foto</label>
              <input 
                type="file" 
                id="story-photo" 
                name="photo" 
                class="form-file" 
                accept="image/*"
                required
                aria-required="true"
                aria-describedby="story-photo-error story-photo-help"
              >
              <small id="story-photo-help" class="form-help">Format: JPG, PNG, atau GIF (max 2MB)</small>
              <span id="story-photo-error" class="error-message" role="alert" aria-live="polite"></span>
              <div id="photo-preview" class="photo-preview"></div>
            </div>

            <div class="form-actions">
              <a href="#/" class="btn btn-secondary">Batal</a>
              <button type="submit" class="btn btn-primary">
                <span class="btn-text">Simpan Cerita</span>
                <span class="btn-loader" style="display: none;">⏳</span>
              </button>
            </div>

            <div id="form-error" class="error-message" role="alert" aria-live="polite"></div>
            <div id="form-success" class="success-message" role="status" aria-live="polite"></div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const addStoryForm = document.getElementById('add-story-form');
    const photoInput = document.getElementById('story-photo');
    const photoPreview = document.getElementById('photo-preview');

    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }

    // Initialize map
    const L = await import('leaflet');
    const map = L.default.map('story-map').setView([-7.2575, 112.7521], 13);

    // Add OpenStreetMap tiles
    L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Fix Leaflet marker icons
    delete L.default.Icon.Default.prototype._getIconUrl;
    L.default.Icon.Default.mergeOptions({
      iconRetinaUrl: 'images/marker-icon-2x.png',
      iconUrl: 'images/marker-icon.png',
      shadowUrl: 'images/marker-shadow.png',
    });

    let currentMarker = null;

    // Add click event to map
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const latInput = document.getElementById('story-lat');
      const lonInput = document.getElementById('story-lon');
      const mapError = document.getElementById('story-map-error');
      
      // Update input fields
      latInput.value = lat.toFixed(4);
      lonInput.value = lng.toFixed(4);
      
      // Clear error
      mapError.textContent = '';
      mapError.style.display = 'none';
      latInput.setAttribute('aria-invalid', 'false');
      lonInput.setAttribute('aria-invalid', 'false');

      // Remove previous marker
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }

      // Add new marker
      currentMarker = L.default.marker([lat, lng])
        .addTo(map)
        .bindPopup(`Koordinat yang dipilih:<br>Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`)
        .openPopup();
    });

    // Photo preview
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
          document.getElementById('story-photo-error').textContent = 'Ukuran file maksimal 2MB';
          photoInput.setAttribute('aria-invalid', 'true');
          photoPreview.innerHTML = '';
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          document.getElementById('story-photo-error').textContent = 'File harus berupa gambar';
          photoInput.setAttribute('aria-invalid', 'true');
          photoPreview.innerHTML = '';
          return;
        }

        // Clear error
        document.getElementById('story-photo-error').textContent = '';
        photoInput.setAttribute('aria-invalid', 'false');

        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
          photoPreview.innerHTML = `
            <img src="${event.target.result}" alt="Preview foto" class="preview-image">
          `;
        };
        reader.readAsDataURL(file);
      }
    });

    // Form submission
    addStoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = addStoryForm.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      const errorDisplay = document.getElementById('form-error');
      const successDisplay = document.getElementById('form-success');
      const mapError = document.getElementById('story-map-error');
      
      // Clear previous messages
      errorDisplay.textContent = '';
      successDisplay.textContent = '';
      errorDisplay.style.display = 'none';
      successDisplay.style.display = 'none';

      // Validate description length
      const descriptionInput = document.getElementById('story-description');
      const descLength = descriptionInput.value.length;
      if (descLength < 10) {
        errorDisplay.textContent = 'Deskripsi harus minimal 10 karakter';
        errorDisplay.style.display = 'block';
        descriptionInput.setAttribute('aria-invalid', 'true');
        return;
      }
      if (descLength > 1000) {
        errorDisplay.textContent = 'Deskripsi maksimal 1000 karakter';
        errorDisplay.style.display = 'block';
        descriptionInput.setAttribute('aria-invalid', 'true');
        return;
      }

      // Validate coordinates
      const latInput = document.getElementById('story-lat');
      const lonInput = document.getElementById('story-lon');
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);

      // Check if coordinates are selected
      if (latInput.value === '' || lonInput.value === '' || isNaN(lat) || isNaN(lon)) {
        mapError.textContent = '⚠️ Silakan pilih lokasi di peta dengan mengklik pada peta';
        mapError.style.display = 'block';
        latInput.setAttribute('aria-invalid', 'true');
        lonInput.setAttribute('aria-invalid', 'true');
        // Scroll to map
        document.getElementById('story-map').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (lat < -90 || lat > 90) {
        errorDisplay.textContent = 'Latitude harus antara -90 dan 90';
        errorDisplay.style.display = 'block';
        latInput.setAttribute('aria-invalid', 'true');
        return;
      }

      if (lon < -180 || lon > 180) {
        errorDisplay.textContent = 'Longitude harus antara -180 dan 180';
        errorDisplay.style.display = 'block';
        lonInput.setAttribute('aria-invalid', 'true');
        return;
      }

      // Show loading
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(addStoryForm);
        // Remove 'name' field as API doesn't accept it
        formData.delete('name');
        // Override with numeric values
        formData.set('lat', lat.toString());
        formData.set('lon', lon.toString());

        // Debug: log FormData contents
        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
          console.log(key, ':', value);
        }

        const response = await addStory(formData, token);

        if (!response.error) {
          successDisplay.textContent = 'Cerita berhasil ditambahkan!';
          successDisplay.style.display = 'block';
          
          // Redirect after 2 seconds
          setTimeout(() => {
            window.location.hash = '#/';
          }, 2000);
        } else {
          console.error('Failed to add story:', response);
          throw new Error(response.message || 'Gagal menambahkan cerita');
        }

      } catch (error) {
        errorDisplay.textContent = error.message;
        errorDisplay.style.display = 'block';
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }
}
