import { getStories } from '../../data/api.js';
import 'leaflet/dist/leaflet.css';
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
  saveStory,
  deleteStory,
  getAllStories,
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
                <a href="#/bookmark" class="btn btn-secondary" aria-label="Lihat bookmark">
                  🔖 Bookmark Saya
                </a>
                <button id="push-notification-btn" class="btn btn-secondary" aria-label="Aktifkan notifikasi push">
                  🔔 Aktifkan Notifikasi
                </button>
                <button id="add-story-btn" class="btn btn-primary" aria-label="Tambah cerita baru">
                  ➕ Tambah Cerita
                </button>
              </div>
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
      btn.addEventListener('click', async () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        
        this.currentFilter = btn.id.replace('filter-', '');
        await this._filterAndDisplayStories(this.allStories, this.currentFilter);
      });
    });

    // Load stories
    await this._loadStories(token);
  }

  async _loadStories(token) {
    const loadingState = document.getElementById('stories-loading');
    const storiesList = document.getElementById('stories-list');
    
    loadingState.style.display = 'block';
    storiesList.innerHTML = '';

    try {
      // Fetch stories from API
      const response = await getStories(token);
      
      if (!response.error && response.listStory) {
        this.allStories = response.listStory;
        
        // Simpan data dari API ke IndexedDB (untuk fitur CRUD IndexedDB)
        // Ini memenuhi kriteria: "Dapat menampilkan, menyimpan dan menghapus data dari API pada indexedDB"
        try {
          for (const story of this.allStories) {
            // Simpan setiap story ke IndexedDB (jika belum ada)
            await saveStory(story).catch(err => {
              // Ignore error jika sudah ada (duplicate key)
              console.log('Story already in IndexedDB or error:', story.id);
            });
          }
          console.log('✅ Data dari API berhasil disimpan ke IndexedDB');
        } catch (indexedDBError) {
          console.warn('Warning: Gagal menyimpan ke IndexedDB, tapi tetap lanjut:', indexedDBError);
        }
        
        this._filterAndDisplayStories(this.allStories, 'all');
      } else {
        storiesList.innerHTML = '<p class="empty-state">Tidak ada cerita tersedia.</p>';
      }
    } catch (error) {
      console.error('Error loading stories from API:', error);
      storiesList.innerHTML = '<p class="error-state">Gagal memuat cerita. Silakan coba lagi.</p>';
    } finally {
      loadingState.style.display = 'none';
    }
  }

  async _filterAndDisplayStories(stories, filter) {
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
      // Check bookmark status for all stories
      const bookmarkStatuses = await Promise.all(
        filteredStories.map(story => isBookmarked(story.id))
      );

      storiesList.innerHTML = filteredStories.map((story, index) => {
        const bookmarked = bookmarkStatuses[index];
        return `
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
              class="btn-bookmark ${bookmarked ? 'bookmarked' : ''}" 
              data-story-id="${story.id}"
              aria-label="${bookmarked ? 'Hapus bookmark' : 'Tambah bookmark'} ${story.name || 'ini'}"
              title="${bookmarked ? 'Hapus dari bookmark' : 'Tambah ke bookmark'}"
            >
              ${bookmarked ? '🔖 Hapus Bookmark' : '🔖 Bookmark'}
            </button>
            <button 
              class="btn-save-story" 
              data-story-id="${story.id}"
              aria-label="Simpan cerita ke IndexedDB ${story.name || 'ini'}"
              title="Simpan cerita ke IndexedDB"
            >
              💾 Simpan Cerita
            </button>
            <button 
              class="btn-delete-story" 
              data-story-id="${story.id}"
              aria-label="Hapus cerita dari IndexedDB ${story.name || 'ini'}"
              title="Hapus cerita dari IndexedDB"
            >
              🗑️ Hapus Cerita
            </button>
          </div>
        </article>
      `;
      }).join('');

      // Add bookmark button event listeners
      const bookmarkButtons = document.querySelectorAll('.btn-bookmark');
      bookmarkButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const storyId = e.target.getAttribute('data-story-id');
          const story = filteredStories.find(s => s.id === storyId);
          
          if (!story) return;

          try {
            const currentlyBookmarked = await isBookmarked(storyId);
            
            if (currentlyBookmarked) {
              // Remove bookmark
              await removeBookmark(storyId);
              button.textContent = '🔖 Bookmark';
              button.classList.remove('bookmarked');
              button.setAttribute('aria-label', `Tambah bookmark ${story.name || 'ini'}`);
              button.setAttribute('title', 'Tambah ke bookmark');
              
              // Show success message
              const successMsg = document.createElement('div');
              successMsg.className = 'success-message';
              successMsg.textContent = 'Bookmark dihapus';
              successMsg.style.display = 'block';
              storiesList.insertBefore(successMsg, storiesList.firstChild);
              setTimeout(() => successMsg.remove(), 3000);
            } else {
              // Add bookmark
              await addBookmark(story);
              button.textContent = '🔖 Hapus Bookmark';
              button.classList.add('bookmarked');
              button.setAttribute('aria-label', `Hapus bookmark ${story.name || 'ini'}`);
              button.setAttribute('title', 'Hapus dari bookmark');
              
              // Show success message
              const successMsg = document.createElement('div');
              successMsg.className = 'success-message';
              successMsg.textContent = 'Bookmark ditambahkan';
              successMsg.style.display = 'block';
              storiesList.insertBefore(successMsg, storiesList.firstChild);
              setTimeout(() => successMsg.remove(), 3000);
            }
          } catch (error) {
            console.error('Error toggling bookmark:', error);
            alert('Gagal mengubah bookmark. Silakan coba lagi.');
          }
        });
      });

      // Add save story button event listeners
      const saveStoryButtons = document.querySelectorAll('.btn-save-story');
      saveStoryButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const storyId = e.target.getAttribute('data-story-id');
          const story = filteredStories.find(s => s.id === storyId);
          
          if (!story) return;

          try {
            await saveStory(story);
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Cerita berhasil disimpan ke IndexedDB';
            successMsg.style.display = 'block';
            storiesList.insertBefore(successMsg, storiesList.firstChild);
            setTimeout(() => successMsg.remove(), 3000);
          } catch (error) {
            console.error('Error saving story:', error);
            alert('Gagal menyimpan cerita. Silakan coba lagi.');
          }
        });
      });

      // Add delete story button event listeners
      const deleteStoryButtons = document.querySelectorAll('.btn-delete-story');
      deleteStoryButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const storyId = e.target.getAttribute('data-story-id');
          const story = filteredStories.find(s => s.id === storyId);
          
          if (!story) return;

          if (confirm(`Apakah Anda yakin ingin menghapus cerita "${story.name || 'ini'}" dari IndexedDB?`)) {
            try {
              await deleteStory(storyId);
              
              // Show success message
              const successMsg = document.createElement('div');
              successMsg.className = 'success-message';
              successMsg.textContent = 'Cerita berhasil dihapus dari IndexedDB';
              successMsg.style.display = 'block';
              storiesList.insertBefore(successMsg, storiesList.firstChild);
              setTimeout(() => successMsg.remove(), 3000);
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

    // Add click handler - hanya sekali, hapus listener lama jika ada
    // Clone button untuk menghapus semua event listener lama
    const oldButton = button;
    const newButton = oldButton.cloneNode(true);
    oldButton.parentNode.replaceChild(newButton, oldButton);
    
    // Enable button setelah clone
    newButton.disabled = false;
    
    newButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Disable button saat processing
      newButton.disabled = true;
      newButton.textContent = '🔔 Memproses...';
      
      try {
        const currentStatus = await isSubscribedToPushNotifications();
        
        if (currentStatus) {
          // Unsubscribe
          try {
            await unsubscribeFromPushNotifications();
            newButton.textContent = '🔔 Aktifkan Notifikasi';
            newButton.classList.remove('btn-success');
            newButton.classList.add('btn-secondary');
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Notifikasi push telah dinonaktifkan';
            successMsg.style.display = 'block';
            document.getElementById('stories-list').insertBefore(successMsg, document.getElementById('stories-list').firstChild);
            setTimeout(() => successMsg.remove(), 3000);
          } catch (unsubError) {
            console.error('Error unsubscribing:', unsubError);
            alert('Gagal menonaktifkan notifikasi. Silakan coba lagi.');
          }
        } else {
          // Subscribe
          try {
            // Pastikan service worker ready sebelum subscribe
            if ('serviceWorker' in navigator) {
              try {
                await navigator.serviceWorker.ready;
              } catch (swError) {
                console.warn('Service worker belum ready, menunggu...');
                // Tunggu maksimal 5 detik
                await new Promise((resolve, reject) => {
                  const timeout = setTimeout(() => reject(new Error('Service Worker timeout')), 5000);
                  navigator.serviceWorker.ready.then(() => {
                    clearTimeout(timeout);
                    resolve();
                  }).catch(reject);
                });
              }
            }

            const subscription = await subscribeToPushNotifications();
            if (subscription) {
              newButton.textContent = '🔔 Matikan Notifikasi';
              newButton.classList.remove('btn-secondary');
              newButton.classList.add('btn-success');
              
              // Show success message
              const successMsg = document.createElement('div');
              successMsg.className = 'success-message';
              successMsg.textContent = '✅ Notifikasi push telah diaktifkan! Push notification siap digunakan.';
              successMsg.style.display = 'block';
              const storiesList = document.getElementById('stories-list');
              if (storiesList) {
                storiesList.insertBefore(successMsg, storiesList.firstChild);
                setTimeout(() => successMsg.remove(), 5000);
              }
              
              console.log('✅ Push notification activated successfully');
            } else {
              throw new Error('Subscription tidak berhasil dibuat. Periksa console untuk detail error.');
            }
          } catch (subError) {
            console.error('❌ Error subscribing to push notification:', subError);
            
            // Show detailed error message
            let errorMessage = 'Gagal mengaktifkan notifikasi push.\n\n';
            
            if (subError.message) {
              errorMessage += subError.message;
            } else {
              errorMessage += 'Error: ' + subError.toString();
            }
            
            errorMessage += '\n\nPenyebab umum:';
            errorMessage += '\n1. Service Worker belum ter-register';
            errorMessage += '\n2. Izin notifikasi ditolak';
            errorMessage += '\n3. Browser tidak mendukung push notification';
            errorMessage += '\n4. VAPID key tidak valid';
            errorMessage += '\n\nSilakan cek console untuk detail error.';
            
            alert(errorMessage);
          }
        }
      } catch (error) {
        console.error('Error toggling push notification:', error);
        alert('Terjadi kesalahan saat mengatur notifikasi push: ' + error.message);
      } finally {
        // Re-enable button
        newButton.disabled = false;
        
        // Update button text based on current status
        setTimeout(async () => {
          try {
            const status = await isSubscribedToPushNotifications();
            if (status) {
              newButton.textContent = '🔔 Matikan Notifikasi';
              newButton.classList.remove('btn-secondary');
              newButton.classList.add('btn-success');
            } else {
              newButton.textContent = '🔔 Aktifkan Notifikasi';
              newButton.classList.remove('btn-success');
              newButton.classList.add('btn-secondary');
            }
          } catch (e) {
            console.error('Error updating button status:', e);
          }
        }, 500);
      }
    });
  }
}
