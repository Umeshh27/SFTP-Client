import { NextResponse } from 'next/server';
import { getSftpClient } from '@/lib/sftp';

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { fromPath, toPath } = body;

    if (!fromPath || !toPath) {
      return NextResponse.json({ error: 'Missing fromPath or toPath' }, { status: 400 });
    }

    const sftp = await getSftpClient();
    await sftp.rename(fromPath, toPath);

    return NextResponse.json({
      message: 'Resource renamed successfully',
      fromPath,
      toPath
    }, { status: 200 });

  } catch (error) {
    console.error('Rename error:', error);
    if (error.code === 2 || (error.message && error.message.includes('No such file'))) {
      return NextResponse.json({ error: 'Original file not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
