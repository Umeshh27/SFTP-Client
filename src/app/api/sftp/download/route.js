import { NextResponse } from 'next/server';
import { getSftpClient } from '@/lib/sftp';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  try {
    const sftp = await getSftpClient();
    
    const stat = await sftp.stat(path);
    const fileSize = stat.size;
    const filename = path.split('/').pop() || 'download';

    const readStream = sftp.createReadStream(path);
    
    request.signal.addEventListener('abort', () => {
      console.log('Client aborted download, destroying SFTP stream');
      readStream.destroy();
    });

    const webStream = new ReadableStream({
      start(controller) {
        readStream.on('data', (chunk) => controller.enqueue(chunk));
        readStream.on('end', () => controller.close());
        readStream.on('error', (err) => {
          console.error('SFTP stream error', err);
          controller.error(err);
        });
        readStream.on('close', () => {
          console.log('SFTP read stream closed');
        });
      },
      cancel() {
        console.log('Web stream cancelled, destroying SFTP stream');
        readStream.destroy();
      }
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileSize.toString()
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    if (error.code === 2 || (error.message && error.message.includes('No such file'))) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
