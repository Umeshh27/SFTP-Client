import { NextResponse } from 'next/server';
import { getSftpClient } from '@/lib/sftp';

export async function DELETE(request) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  try {
    const sftp = await getSftpClient();
    
    const stat = await sftp.stat(path);
    if (stat.isDirectory) {
      await sftp.rmdir(path);
    } else {
      await sftp.delete(path);
    }

    return NextResponse.json({
      message: 'Resource deleted successfully',
      path
    }, { status: 200 });

  } catch (error) {
    console.error('Delete error:', error);
    if (error.code === 2 || (error.message && error.message.includes('No such file'))) {
      return NextResponse.json({ error: 'File or directory not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
