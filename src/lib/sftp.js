import Client from 'ssh2-sftp-client';

const globalSftpClients = new Map();

export async function getSftpClient() {
  const instanceId = 'default';

  if (globalSftpClients.has(instanceId)) {
    return globalSftpClients.get(instanceId);
  }

  const sftp = new Client();

  sftp.on('close', () => {
    console.log('SFTP connection closed');
    globalSftpClients.delete(instanceId);
  });

  sftp.on('error', (err) => {
    console.error('SFTP connection error:', err);
    globalSftpClients.delete(instanceId);
  });

  sftp.on('end', () => {
    console.log('SFTP connection ended');
    globalSftpClients.delete(instanceId);
  });

  let retries = 3;
  while (retries > 0) {
    try {
      await sftp.connect({
        host: process.env.SFTP_HOST,
        port: parseInt(process.env.SFTP_PORT || '22', 10),
        username: process.env.SFTP_USER,
        password: process.env.SFTP_PASSWORD,
        readyTimeout: 5000,
      });
      console.log('SFTP connected successfully');
      globalSftpClients.set(instanceId, sftp);
      return sftp;
    } catch (error) {
      console.error(`Failed to connect to SFTP, retries left: ${retries - 1}`, error);
      retries--;
      if (retries === 0) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error('Unreachable code');
}

export async function closeSftpClient() {
  const instanceId = 'default';
  if (globalSftpClients.has(instanceId)) {
    const sftp = globalSftpClients.get(instanceId);
    try {
      await sftp.end();
    } catch (e) {
      console.error('Error closing SFTP client', e);
    }
    globalSftpClients.delete(instanceId);
  }
}
