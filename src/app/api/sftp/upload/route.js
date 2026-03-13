import { NextResponse } from 'next/server';
import { getSftpClient } from '@/lib/sftp';
import busboy from 'busboy';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
    }

    const bb = busboy({ headers: { 'content-type': contentType }, limits: { fileSize: 100 * 1024 * 1024 } });
    const sftp = await getSftpClient();

    let destPath = '';
    
    const uploadPromise = new Promise((resolve, reject) => {
      let isFileProcessed = false;

      bb.on('field', (name, val) => {
        if (name === 'path') destPath = val;
      });

      bb.on('file', (name, fileStream, info) => {
        if (name !== 'file') {
          fileStream.resume(); 
          return;
        }

        if (!destPath) {
          fileStream.resume();
          return reject(new Error('Path field must precede file field'));
        }

        isFileProcessed = true;
        const fullPath = `${destPath.replace(/\/$/, '')}/${info.filename}`;
        
        fileStream.on('limit', () => {
          reject(new Error('Payload Too Large'));
        });

        sftp.put(fileStream, fullPath).then(() => {
          resolve({ message: 'File uploaded successfully', filePath: fullPath });
        }).catch(err => {
          reject(err);
        });
      });

      bb.on('finish', () => {
        if (!isFileProcessed) {
          reject(new Error('No file uploaded'));
        }
      });

      bb.on('error', reject);
    });

    if (!request.body) throw new Error('Request body is empty');
    const nodeStream = Readable.fromWeb(request.body);
    nodeStream.pipe(bb);

    const result = await uploadPromise;
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    if (error.message === 'Payload Too Large') {
      return NextResponse.json({ error: error.message }, { status: 413 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
