import app from './app.js';

const portValue = process.env.PORT ?? '3000';
const port = Number(portValue);

if (!/^\d+$/.test(portValue) || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT, 1 ile 65535 arasında bir tam sayı olmalıdır.');
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log(`TASKFLOW sunucusu ${port} portunda çalışıyor.`);
});

server.on('error', (error) => {
  console.error('Sunucu başlatılamadı:', error.message);
  process.exitCode = 1;
});
