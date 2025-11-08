// IndexedDB utility untuk menyimpan dan mengambil bookmarks (bukan cache)
const DB_NAME = 'StoryMapDB';
const DB_VERSION = 2; // Increment version untuk upgrade schema
const BOOKMARK_STORE_NAME = 'bookmarks';

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
      
      // Hapus store lama jika ada (untuk migrasi dari cache ke bookmark)
      if (db.objectStoreNames.contains('stories')) {
        db.deleteObjectStore('stories');
      }
      
      // Create bookmark store untuk fitur bookmark user-driven
      if (!db.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
        const objectStore = db.createObjectStore(BOOKMARK_STORE_NAME, {
          keyPath: 'storyId',
          autoIncrement: false,
        });
        
        // Create index for filtering
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('bookmarkedAt', 'bookmarkedAt', { unique: false });
        
        console.log('IndexedDB: Bookmark store created');
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

