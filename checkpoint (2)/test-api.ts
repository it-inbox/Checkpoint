import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function test() {
  console.log('Testing connection to Python server on http://localhost:8000...');
  try {
    const health = await axios.get('http://localhost:8000/health');
    console.log('Python server health check success:', health.data);
  } catch (err: any) {
    console.error('Python server is NOT reachable on http://localhost:8000:', err.message);
    return;
  }

  console.log('Testing multipart/form-data request...');
  try {
    // Let's create dummy buffers to test the request structure
    const profileBuffer = Buffer.from('dummy-profile-image-content');
    const captureBuffer = Buffer.from('dummy-capture-image-content');

    const form = new FormData();
    const profileBlob = new Blob([profileBuffer as any], { type: 'image/jpeg' });
    form.append('profile_image', profileBlob, 'profile.jpg');

    const captureBlob = new Blob([captureBuffer as any], { type: 'image/jpeg' });
    form.append('capture_image', captureBlob, 'capture.jpg');

    const targetUrl = 'http://localhost:8000/api/v1/attendance/mark';
    console.log('Sending test request to:', targetUrl);
    
    const response = await axios.post(targetUrl, form, {
      timeout: 10000
    });
    console.log('Response:', response.data);
  } catch (err: any) {
    console.error('Request failed with error:');
    console.error(err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
  }
}

test();
