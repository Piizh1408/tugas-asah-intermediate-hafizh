import CONFIG from '../config';

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
};

export async function getStories(token) {
  const fetchResponse = await fetch(ENDPOINTS.STORIES, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await fetchResponse.json();
}

export async function addStory(formData, token) {
  try {
    const fetchResponse = await fetch(ENDPOINTS.ADD_STORY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    console.log('Response status:', fetchResponse.status);
    
    let result;
    try {
      result = await fetchResponse.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      result = { error: true, message: 'Invalid response from server' };
    }
    
    if (!fetchResponse.ok) {
      result.error = true;
      console.error('API Error Response:', result);
    }
    
    return result;
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: true, message: error.message };
  }
}