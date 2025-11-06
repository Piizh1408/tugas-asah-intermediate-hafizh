// IndexedDB utility untuk menyimpan dan mengambil stories
const DB_NAME = 'StoryMapDB';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

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
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: false,
        });
        
        // Create index for filtering
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        
        console.log('IndexedDB: Object store created');
      }
    };
  });
}

// Create - Menyimpan story ke IndexedDB
export async function saveStoryToIndexedDB(story) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Generate ID if not present (for new stories)
    const storyId = story.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add or update story
    const request = store.put({
      id: storyId,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      lat: story.lat,
      lon: story.lon,
      createdAt: story.createdAt || new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    });

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB: Story saved', storyId);
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

// Read - Membaca semua stories dari IndexedDB
export async function getAllStoriesFromIndexedDB() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
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

// Read - Membaca single story dari IndexedDB
export async function getStoryFromIndexedDB(storyId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
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

// Delete - Menghapus story dari IndexedDB
export async function deleteStoryFromIndexedDB(storyId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
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

// Clear all stories
export async function clearAllStoriesFromIndexedDB() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('IndexedDB: All stories cleared');
        resolve(true);
      };
      request.onerror = () => {
        console.error('IndexedDB: Error clearing stories', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to clear stories', error);
    throw error;
  }
}

