import { getAllBookmarks, removeBookmark, getAllStories, deleteStory } from '../../utils/indexeddb.js';
import 'leaflet/dist/leaflet.css';

export default class BookmarkPage {
  async render() {
    return `
      <section class="home-container">
        <div class="hero-section">
          <h1 class="hero-title">🔖 Bookmark Saya</h1>
          <p class="hero-subtitle">Cerita yang telah Anda simpan</p>
        </div>

        <div class="content-grid">
          <div class="map-container">
            <div id="bookmark-map" role="application" aria-label="Peta lokasi cerita bookmark"></div>
          </div>

          <div class="stories-sidebar">
            <div class="stories-header">
              <h2>Daftar Bookmark</h2>
              <div class="header-actions">
                <button id="show-bookmarks-btn" class="btn btn-secondary active">🔖 Bookmark</button>
                <button id="show-stories-btn" class="btn btn-secondary">💾 Cerita Tersimpan</button>
              </div>
            </div>
            <div id="bookmarks-list" class="stories-list" role="list"></div>
            <div id="stories-list" class="stories-list" role="list" style="display: none;"></div>
            <div id="bookmarks-loading" class="loading-state" style="display: none;">
              <p>Memuat bookmark...</p>
            </div>
            <div id="stories-loading" class="loading-state" style="display: none;">
              <p>Memuat cerita tersimpan...</p>
            </div>
            <div id="bookmarks-empty" class="empty-state" style="display: none;">
              <p>Belum ada bookmark. Bookmark cerita favorit Anda dari halaman beranda!</p>
            </div>
            <div id="stories-empty" class="empty-state" style="display: none;">
              <p>Belum ada cerita tersimpan. Simpan cerita dari halaman beranda!</p>
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
    const map = L.map('bookmark-map').setView([-2.5, 118], 5);

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
    this.bookmarks = [];
    this.stories = [];
    this.map = map;
    this.L = L;
    this.currentView = 'bookmarks'; // 'bookmarks' or 'stories'

    // Setup view toggle buttons
    const showBookmarksBtn = document.getElementById('show-bookmarks-btn');
    const showStoriesBtn = document.getElementById('show-stories-btn');
    
    showBookmarksBtn.addEventListener('click', () => {
      this.currentView = 'bookmarks';
      showBookmarksBtn.classList.add('active');
      showStoriesBtn.classList.remove('active');
      document.getElementById('bookmarks-list').style.display = 'block';
      document.getElementById('stories-list').style.display = 'none';
      this._loadBookmarks();
    });

    showStoriesBtn.addEventListener('click', () => {
      this.currentView = 'stories';
      showStoriesBtn.classList.add('active');
      showBookmarksBtn.classList.remove('active');
      document.getElementById('bookmarks-list').style.display = 'none';
      document.getElementById('stories-list').style.display = 'block';
      this._loadStories();
    });

    // Load bookmarks by default
    await this._loadBookmarks();
  }

  async _loadBookmarks() {
    const loadingState = document.getElementById('bookmarks-loading');
    const bookmarksList = document.getElementById('bookmarks-list');
    const emptyState = document.getElementById('bookmarks-empty');
    
    loadingState.style.display = 'block';
    bookmarksList.innerHTML = '';
    emptyState.style.display = 'none';

    try {
      const bookmarks = await getAllBookmarks();
      
      if (bookmarks && bookmarks.length > 0) {
        this.bookmarks = bookmarks;
        this._displayBookmarks(bookmarks);
        emptyState.style.display = 'none';
      } else {
        bookmarksList.innerHTML = '';
        emptyState.style.display = 'block';
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      bookmarksList.innerHTML = '<p class="error-state">Gagal memuat bookmark. Silakan coba lagi.</p>';
      emptyState.style.display = 'none';
    } finally {
      loadingState.style.display = 'none';
    }
  }

  _displayBookmarks(bookmarks) {
    const bookmarksList = document.getElementById('bookmarks-list');
    
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    if (bookmarks.length === 0) {
      bookmarksList.innerHTML = '<p class="empty-state">Tidak ada bookmark</p>';
      return;
    }

    bookmarksList.innerHTML = bookmarks.map(bookmark => `
      <article class="story-card" role="listitem" data-story-id="${bookmark.storyId}">
        <div class="story-header">
          <img 
            src="${bookmark.photoUrl}" 
            alt="${bookmark.name || 'Gambar cerita'}"
            class="story-image"
            loading="lazy"
          >
          <div class="story-title-section">
            <h3 class="story-title">${bookmark.name || 'Untitled'}</h3>
            <p class="story-author">by ${bookmark.name || 'Anonymous'}</p>
          </div>
        </div>
        <p class="story-description">${bookmark.description || 'No description available.'}</p>
        <div class="story-footer">
          <span class="story-location">📍 ${bookmark.lat}, ${bookmark.lon}</span>
          <time class="story-date" datetime="${bookmark.createdAt}">
            ${this._formatDate(bookmark.createdAt)}
          </time>
        </div>
        <div class="story-actions">
          <button 
            class="btn-remove-bookmark" 
            data-story-id="${bookmark.storyId}"
            aria-label="Hapus bookmark ${bookmark.name || 'ini'}"
            title="Hapus dari bookmark"
          >
            🗑️ Hapus Bookmark
          </button>
        </div>
      </article>
    `).join('');

    // Add delete button event listeners
    const removeButtons = document.querySelectorAll('.btn-remove-bookmark');
    removeButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const storyId = e.target.getAttribute('data-story-id');
        if (storyId && confirm('Apakah Anda yakin ingin menghapus bookmark ini?')) {
          try {
            await removeBookmark(storyId);
            // Reload bookmarks
            await this._loadBookmarks();
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Bookmark berhasil dihapus';
            successMsg.style.display = 'block';
            bookmarksList.insertBefore(successMsg, bookmarksList.firstChild);
            
            setTimeout(() => {
              successMsg.remove();
            }, 3000);
          } catch (error) {
            console.error('Error removing bookmark:', error);
            alert('Gagal menghapus bookmark. Silakan coba lagi.');
          }
        }
      });
    });

    // Add markers to map
    bookmarks.forEach(bookmark => {
      if (bookmark.lat && bookmark.lon) {
        const marker = this.L.marker([bookmark.lat, bookmark.lon])
          .addTo(this.map)
          .bindPopup(`
            <div class="marker-popup">
              <h4>${bookmark.name || 'Untitled'}</h4>
              <p>${bookmark.description || ''}</p>
              <img src="${bookmark.photoUrl}" alt="${bookmark.name || ''}" style="max-width: 200px; margin-top: 10px;">
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

  async _loadStories() {
    const loadingState = document.getElementById('stories-loading');
    const storiesList = document.getElementById('stories-list');
    const emptyState = document.getElementById('stories-empty');
    
    loadingState.style.display = 'block';
    storiesList.innerHTML = '';
    emptyState.style.display = 'none';

    try {
      const stories = await getAllStories();
      
      if (stories && stories.length > 0) {
        this.stories = stories;
        this._displayStories(stories);
        emptyState.style.display = 'none';
      } else {
        storiesList.innerHTML = '';
        emptyState.style.display = 'block';
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      storiesList.innerHTML = '<p class="error-state">Gagal memuat cerita tersimpan. Silakan coba lagi.</p>';
      emptyState.style.display = 'none';
    } finally {
      loadingState.style.display = 'none';
    }
  }

  _displayStories(stories) {
    const storiesList = document.getElementById('stories-list');
    
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    if (stories.length === 0) {
      storiesList.innerHTML = '<p class="empty-state">Tidak ada cerita tersimpan</p>';
      return;
    }

    storiesList.innerHTML = stories.map(story => `
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
            aria-label="Hapus cerita ${story.name || 'ini'} dari IndexedDB"
            title="Hapus cerita dari IndexedDB"
          >
            🗑️ Hapus Cerita
          </button>
        </div>
      </article>
    `).join('');

    // Add delete button event listeners
    const deleteButtons = document.querySelectorAll('.btn-delete-story');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const storyId = e.target.getAttribute('data-story-id');
        const story = stories.find(s => s.id === storyId);
        
        if (storyId && confirm(`Apakah Anda yakin ingin menghapus cerita "${story?.name || 'ini'}" dari IndexedDB?`)) {
          try {
            await deleteStory(storyId);
            // Reload stories
            await this._loadStories();
            
            // Show success message
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
    stories.forEach(story => {
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

  _formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  }
}

