import FileManager from '@/components/FileManager';
import { getSftpClient } from '@/lib/sftp';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialPath = '/upload';
  let initialFiles = [];
  
  try {
    const sftp = await getSftpClient();
    const list = await sftp.list(initialPath);
    initialFiles = list.map(item => ({
      name: item.name,
      type: item.type,
      size: item.size,
      modifyTime: item.modifyTime,
      rights: item.rights
    }));
  } catch (error) {
    console.error('Failed to load initial files from SFTP on server component render:', error);
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col gap-4">
        <header className="flex-shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-800">Secure SFTP Manager</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage remote files directly from your browser securely.</p>
        </header>

        <section className="flex-1 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
          <FileManager initialPath={initialPath} initialFiles={initialFiles} />
        </section>
      </div>
    </main>
  );
}
