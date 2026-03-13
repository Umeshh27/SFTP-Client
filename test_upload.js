const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  formData.append('path', '/upload');
  
  // Create a 10MB file in memory to test
  const bigBuffer = Buffer.alloc(10 * 1024 * 1024, 'a');
  const blob = new Blob([bigBuffer]);
  
  formData.append('file', blob, 'test-download.txt'); // req submission.json expects test-download.txt

  console.log('Uploading 10MB test file...');
  const res = await fetch('http://localhost:3000/api/sftp/upload', {
    method: 'POST',
    body: formData
  });

  const text = await res.text();
  console.log('Upload response:', res.status, text);
}

testUpload().catch(console.error);
