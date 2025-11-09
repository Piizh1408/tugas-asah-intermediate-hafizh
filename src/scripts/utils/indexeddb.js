// IndexedDB utility untuk menyimpan dan mengambil bookmarks dan stories
const DB_NAME = 'StoryMapDB';
const DB_VERSION = 3; // Increment version untuk upgrade schema - tambah stories store
const BOOKMARK_STORE_NAME = 'bookmarks';
const STORIES_STORE_NAME = 'stories';

// Initialize database
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB: Error opening database');
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('IndexedDB: Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create bookmark store untuk fitur bookmark user-driven
      if (!db.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
        const bookmarkStore = db.createObjectStore(BOOKMARK_STORE_NAME, {
          keyPath: 'storyId',
          autoIncrement: false,
        });
        
        // Create index for filtering
        bookmarkStore.createIndex('name', 'name', { unique: false });
        bookmarkStore.createIndex('bookmarkedAt', 'bookmarkedAt', { unique: false });
        
        console.log('IndexedDB: Bookmark store created');
      }
      
      // Create stories store untuk menyimpan cerita ke IndexedDB
      if (!db.objectStoreNames.contains(STORIES_STORE_NAME)) {
        const storiesStore = db.createObjectStore(STORIES_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: false,
        });
        
        // Create index for filtering
        storiesStore.createIndex('name', 'name', { unique: false });
        storiesStore.createIndex('createdAt', 'createdAt', { unique: false });
        
        console.log('IndexedDB: Stories store created');
      }
    };
  });
}

// Create - Menyimpan bookmark story ke IndexedDB (user-driven action)
export async function addBookmark(story) {
  try {
    const db = await initDB();
    const transaction = db.transaction([BOOKMARK_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(BOOKMARK_STORE_NAME);

    // Simpan story sebagai bookmark dengan storyId sebagai key
    const bookmarkData = {
      storyId: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      lat: story.lat,
      lon: story.lon,
      createdAt: story.createdAt || new Date().toISOString(),
      bookmarkedAt: new Date().toISOString(), // Waktu user bookmark
    };

    const request = store.put(bookmarkData);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB: Bookmark added', story.id);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error adding bookmark', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to add bookmark', error);
    throw error;
  }
}

// Read - Membaca semua bookmarks dari IndexedDB
export async function getAllBookmarks() {
  try {
    const db = await initDB();
    const transaction = db.transaction([BOOKMARK_STORE_NAME], 'readonly');
    const store = transaction.objectStore(BOOKMARK_STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB: Bookmarks retrieved', request.result.length);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error reading bookmarks', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to read bookmarks', error);
    throw error;
  }
}

// Read - Cek apakah story sudah di-bookmark
export async function isBookmarked(storyId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([BOOKMARK_STORE_NAME], 'readonly');
    const store = transaction.objectStore(BOOKMARK_STORE_NAME);
    const request = store.get(storyId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result !== undefined);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error checking bookmark', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to check bookmark', error);
    throw error;
  }
}

// Delete - Menghapus bookmark dari IndexedDB (user-driven action)
export async function removeBookmark(storyId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([BOOKMARK_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(BOOKMARK_STORE_NAME);
    const request = store.delete(storyId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB: Bookmark removed', storyId);
        resolve(true);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error removing bookmark', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to remove bookmark', error);
    throw error;
  }
}

// ========== CRUD Operations untuk Stories ==========

// Create - Menyimpan cerita ke IndexedDB
export async function saveStory(story) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORIES_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORIES_STORE_NAME);

    // Simpan story dengan id sebagai key
    const storyData = {
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      lat: story.lat,
      lon: story.lon,
      createdAt: story.createdAt || new Date().toISOString(),
      savedAt: new Date().toISOString(), // Waktu user simpan
    };

    const request = store.put(storyData);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB: Story saved', story.id);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error saving story', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to save story', error);
    throw error;
  }
}

// Read - Membaca semua cerita dari IndexedDB
export async function getAllStories() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORIES_STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB: Stories retrieved', request.result.length);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error reading stories', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to read stories', error);
    throw error;
  }
}

// Read - Membaca satu cerita dari IndexedDB
export async function getStory(storyId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORIES_STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    const request = store.get(storyId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error reading story', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to read story', error);
    throw error;
  }
}

// Delete - Menghapus cerita dari IndexedDB
export async function deleteStory(storyId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORIES_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    const request = store.delete(storyId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB: Story deleted', storyId);
        resolve(true);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error deleting story', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to delete story', error);
    throw error;
  }
}

