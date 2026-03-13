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
    const list = await sftp.list(path);

    const formattedList = list.map(item => ({
      name: item.name,
      type: item.type,
      size: item.size,
      modifyTime: item.modifyTime,
      rights: item.rights
    }));

    return NextResponse.json(formattedList, { status: 200 });
  } catch (error) {
    console.error('SFTP list error:', error);
    
    const message = error.message || '';
    if (message.includes('No such file') || error.code === 2) {
      return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
    }
    if (message.includes('Permission denied') || error.code === 3) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
