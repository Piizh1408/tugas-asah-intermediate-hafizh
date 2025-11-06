import { getStories } from '../../data/api.js';
import 'leaflet/dist/leaflet.css';
import {
  saveStoryToIndexedDB,
  getAllStoriesFromIndexedDB,
  deleteStoryFromIndexedDB,
} from '../../utils/indexeddb.js';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
} from '../../utils/push-notification.js';

export default class HomePage {
  async render() {
    return `
      <section class="home-container">
        <div class="hero-section">
          <h1 class="hero-title">📖 StoryMap</h1>
          <p class="hero-subtitle">Temukan dan bagikan cerita perjalanan dari berbagai tempat</p>
        </div>

        <div class="map-controls">
          <button id="filter-all" class="filter-btn active" aria-pressed="true">Semua</button>
          <button id="filter-science" class="filter-btn" aria-pressed="false">Sains</button>
          <button id="filter-history" class="filter-btn" aria-pressed="false">Sejarah</button>
          <button id="filter-nature" class="filter-btn" aria-pressed="false">Alam</button>
        </div>

        <div class="content-grid">
          <div class="map-container">
            <div id="map" role="application" aria-label="Peta lokasi cerita"></div>
          </div>

          <div class="stories-sidebar">
            <div class="stories-header">
              <h2>Daftar Cerita</h2>
              <div class="header-actions">
                <button id="push-notification-btn" class="btn btn-secondary" aria-label="Aktifkan notifikasi push">
                  🔔 Aktifkan Notifikasi
                </button>
                <button id="add-story-btn" class="btn btn-primary" aria-label="Tambah cerita baru">
                  ➕ Tambah Cerita
                </button>
              </div>
            </div>
            <div id="offline-indicator" class="offline-indicator" style="display: none;">
              <span>📴 Mode Offline - Menampilkan data dari IndexedDB</span>
            </div>
            <div id="stories-list" class="stories-list" role="list"></div>
            <div id="stories-loading" class="loading-state" style="display: none;">
              <p>Memuat cerita...</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }

    // Import leaflet here to avoid SSR issues
    const L = await import('leaflet');
    
    // Initialize map centered on Indonesia
    const map = L.map('map').setView([-2.5, 118], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Fix Leaflet marker icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'images/marker-icon-2x.png',
      iconUrl: 'images/marker-icon.png',
      shadowUrl: 'images/marker-shadow.png',
    });

    this.markers = [];
    this.allStories = [];
    this.currentFilter = 'all';
    this.map = map;
    this.L = L;

    const addStoryBtn = document.getElementById('add-story-btn');
    addStoryBtn.addEventListener('click', () => {
      window.location.hash = '#/add-story';
    });

    // Push notification button - wait for service worker to be ready
    const pushNotificationBtn = document.getElementById('push-notification-btn');
    
    // Setup button after service worker is ready
    this._setupPushNotificationButtonWithRetry(pushNotificationBtn);

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        
        this.currentFilter = btn.id.replace('filter-', '');
        this._filterAndDisplayStories(this.allStories, this.currentFilter);
      });
    });

    // Load stories
    await this._loadStories(token);
  }

  async _loadStories(token) {
    const loadingState = document.getElementById('stories-loading');
    const storiesList = document.getElementById('stories-list');
    const offlineIndicator = document.getElementById('offline-indicator');
    
    loadingState.style.display = 'block';
    storiesList.innerHTML = '';
    offlineIndicator.style.display = 'none';

    try {
      // Try to fetch from API first
      const response = await getStories(token);
      
      if (!response.error && response.listStory) {
        this.allStories = response.listStory;
        
        // Save all stories to IndexedDB
        for (const story of this.allStories) {
          try {
            await saveStoryToIndexedDB(story);
          } catch (error) {
            console.error('Error saving story to IndexedDB:', error);
          }
        }
        
        this._filterAndDisplayStories(this.allStories, 'all');
        offlineIndicator.style.display = 'none';
      } else {
        // If API fails, try loading from IndexedDB
        await this._loadStoriesFromIndexedDB();
      }
    } catch (error) {
      console.error('Error loading stories from API:', error);
      // Load from IndexedDB as fallback
      await this._loadStoriesFromIndexedDB();
    } finally {
      loadingState.style.display = 'none';
    }
  }

  async _loadStoriesFromIndexedDB() {
    const storiesList = document.getElementById('stories-list');
    const offlineIndicator = document.getElementById('offline-indicator');
    
    try {
      const stories = await getAllStoriesFromIndexedDB();
      if (stories && stories.length > 0) {
        this.allStories = stories;
        this._filterAndDisplayStories(this.allStories, 'all');
        offlineIndicator.style.display = 'block';
      } else {
        storiesList.innerHTML = '<p class="empty-state">Tidak ada cerita tersedia. Periksa koneksi internet Anda.</p>';
        offlineIndicator.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading stories from IndexedDB:', error);
      storiesList.innerHTML = '<p class="error-state">Gagal memuat cerita. Silakan coba lagi.</p>';
      offlineIndicator.style.display = 'none';
    }
  }

  _filterAndDisplayStories(stories, filter) {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // Filter stories
    let filteredStories = stories;
    if (filter !== 'all') {
      filteredStories = stories.filter(story => 
        story.name?.toLowerCase().includes(filter) || 
        story.description?.toLowerCase().includes(filter)
      );
    }

    // Display stories in list
    const storiesList = document.getElementById('stories-list');
    if (filteredStories.length === 0) {
      storiesList.innerHTML = '<p class="empty-state">Tidak ada cerita untuk filter ini</p>';
    } else {
      storiesList.innerHTML = filteredStories.map(story => `
        <article class="story-card" role="listitem" data-story-id="${story.id}">
          <div class="story-header">
            <img 
              src="${story.photoUrl}" 
              alt="${story.name || 'Gambar cerita'}"
              class="story-image"
              loading="lazy"
            >
            <div class="story-title-section">
              <h3 class="story-title">${story.name || 'Untitled'}</h3>
              <p class="story-author">by ${story.name || 'Anonymous'}</p>
            </div>
          </div>
          <p class="story-description">${story.description || 'No description available.'}</p>
          <div class="story-footer">
            <span class="story-location">📍 ${story.lat}, ${story.lon}</span>
            <time class="story-date" datetime="${story.createdAt}">
              ${this._formatDate(story.createdAt)}
            </time>
          </div>
          <div class="story-actions">
            <button 
              class="btn-delete-story" 
              data-story-id="${story.id}"
              aria-label="Hapus cerita ${story.name || 'ini'}"
              title="Hapus dari IndexedDB"
            >
              🗑️ Hapus
            </button>
          </div>
        </article>
      `).join('');

      // Add delete button event listeners
      const deleteButtons = document.querySelectorAll('.btn-delete-story');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const storyId = e.target.getAttribute('data-story-id');
          if (storyId && confirm('Apakah Anda yakin ingin menghapus cerita ini dari IndexedDB?')) {
            try {
              await deleteStoryFromIndexedDB(storyId);
              // Remove from current display
              this.allStories = this.allStories.filter(s => s.id !== storyId);
              this._filterAndDisplayStories(this.allStories, this.currentFilter);
              
              // Show success message
              const storiesList = document.getElementById('stories-list');
              const successMsg = document.createElement('div');
              successMsg.className = 'success-message';
              successMsg.textContent = 'Cerita berhasil dihapus dari IndexedDB';
              successMsg.style.display = 'block';
              storiesList.insertBefore(successMsg, storiesList.firstChild);
              
              setTimeout(() => {
                successMsg.remove();
              }, 3000);
            } catch (error) {
              console.error('Error deleting story:', error);
              alert('Gagal menghapus cerita. Silakan coba lagi.');
            }
          }
        });
      });

      // Add markers to map
      filteredStories.forEach(story => {
        if (story.lat && story.lon) {
          const marker = this.L.marker([story.lat, story.lon])
            .addTo(this.map)
            .bindPopup(`
              <div class="marker-popup">
                <h4>${story.name || 'Untitled'}</h4>
                <p>${story.description || ''}</p>
                <img src="${story.photoUrl}" alt="${story.name || ''}" style="max-width: 200px; margin-top: 10px;">
              </div>
            `);
          
          this.markers.push(marker);
        }
      });

      // Fit map to show all markers
      if (this.markers.length > 0) {
        const group = new this.L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }

  _formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  }

  async _setupPushNotificationButtonWithRetry(button) {
    if (!button) return;
    
    // Show loading state
    button.textContent = '🔔 Memuat...';
    button.disabled = true;

    // Try multiple times with delay
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        await this._setupPushNotificationButton(button);
        
        // If button is enabled, setup was successful
        if (!button.disabled || button.textContent.includes('Aktifkan') || button.textContent.includes('Matikan')) {
          return;
        }
      } catch (error) {
        console.error('Error setting up push notification button:', error);
      }
    }
    
    // Final attempt - check if we're on file://
    if (window.location.protocol === 'file:') {
      button.disabled = true;
      button.textContent = '🔔 Perlu HTTP Server';
      button.title = 'Aplikasi harus di-serve via http://localhost (npm run serve)';
    }
  }

  async _setupPushNotificationButton(button) {
    if (!button) return;

    // Check basic support
    if (!('serviceWorker' in navigator)) {
      button.disabled = true;
      button.textContent = '🔔 Notifikasi Tidak Didukung';
      button.title = 'Browser Anda tidak mendukung service worker';
      return;
    }

    if (!('PushManager' in window)) {
      button.disabled = true;
      button.textContent = '🔔 Notifikasi Tidak Didukung';
      button.title = 'Browser Anda tidak mendukung push notification';
      return;
    }
    
    // Check if we're on file:// protocol
    if (window.location.protocol === 'file:') {
      button.disabled = true;
      button.textContent = '🔔 Perlu HTTP Server';
      button.title = 'Aplikasi harus di-serve via http://localhost. Jalankan: npm run serve';
      return;
    }

    // Wait for service worker to be ready
    try {
      // Wait up to 5 seconds for service worker to be ready
      let registration = null;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!registration && attempts < maxAttempts) {
        try {
          registration = await navigator.serviceWorker.ready;
          break;
        } catch (e) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (!registration) {
        button.disabled = true;
        button.textContent = '🔔 Menunggu Service Worker...';
        button.title = 'Service worker sedang dimuat, silakan refresh halaman';
        return;
      }

      // Check current subscription status
      const isSubscribed = await isSubscribedToPushNotifications();
      
      if (isSubscribed) {
        button.textContent = '🔔 Matikan Notifikasi';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-success');
      } else {
        button.textContent = '🔔 Aktifkan Notifikasi';
        button.classList.remove('btn-success');
        button.classList.add('btn-secondary');
      }
    } catch (error) {
      console.error('Error setting up push notification button:', error);
      button.disabled = true;
      button.textContent = '🔔 Error Setup';
      button.title = 'Terjadi error saat setup: ' + error.message;
    }

    // Add click handler
    button.addEventListener('click', async () => {
      const currentStatus = await isSubscribedToPushNotifications();
      
      try {
        if (currentStatus) {
          // Unsubscribe
          await unsubscribeFromPushNotifications();
          button.textContent = '🔔 Aktifkan Notifikasi';
          button.classList.remove('btn-success');
          button.classList.add('btn-secondary');
          alert('Notifikasi push telah dinonaktifkan');
        } else {
          // Subscribe
          const subscription = await subscribeToPushNotifications();
          if (subscription) {
            button.textContent = '🔔 Matikan Notifikasi';
            button.classList.remove('btn-secondary');
            button.classList.add('btn-success');
            alert('Notifikasi push telah diaktifkan!');
          } else {
            alert('Gagal mengaktifkan notifikasi push. Pastikan Anda memberikan izin.');
          }
        }
      } catch (error) {
        console.error('Error toggling push notification:', error);
        alert('Terjadi kesalahan saat mengatur notifikasi push');
      }
    });
  }
}
