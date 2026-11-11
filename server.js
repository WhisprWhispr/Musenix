/**
 * MUSENIX Musical - Official Web Server
 * Modern, High-Performance Node.js Server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive',
  '.ipa': 'application/octet-stream',
  '.mobileconfig': 'application/x-apple-aspen-config',
  '.plist': 'application/xml',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

// Find APK file path (check public/downloads or flutter build output)
function getApkFilePath() {
  const namedApk = path.join(PUBLIC_DIR, 'downloads', 'MusenixMusical-1.0.0.apk');
  if (fs.existsSync(namedApk)) return namedApk;

  const flutterNamedApk = path.join(__dirname, '..', 'build', 'app', 'outputs', 'flutter-apk', 'MusenixMusical-1.0.0.apk');
  if (fs.existsSync(flutterNamedApk)) return flutterNamedApk;

  const flutterApk = path.join(__dirname, '..', 'build', 'app', 'outputs', 'flutter-apk', 'app-release.apk');
  if (fs.existsSync(flutterApk)) return flutterApk;

  const localApk = path.join(PUBLIC_DIR, 'downloads', 'musenix-musical-release.apk');
  if (fs.existsSync(localApk)) return localApk;

  return null;
}

// Find iOS IPA file path
function getIpaFilePath() {
  const namedIpa = path.join(PUBLIC_DIR, 'downloads', 'MusenixMusical-1.0.0.ipa');
  if (fs.existsSync(namedIpa)) return namedIpa;

  const localIpa = path.join(PUBLIC_DIR, 'downloads', 'musenix-musical-release.ipa');
  if (fs.existsSync(localIpa)) return localIpa;
  return null;
}

// Find iOS Profile (.mobileconfig)
function getProfileFilePath() {
  const localProfile = path.join(PUBLIC_DIR, 'downloads', 'musenix-musical.mobileconfig');
  if (fs.existsSync(localProfile)) return localProfile;
  return null;
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // Security & normalization: ensure forward slashes and prevent directory traversal
  const cleanPath = pathname.replace(/\\/g, '/');
  const safePath = path.posix.normalize(cleanPath).replace(/^(\.\.[\/])+/g, '');
  const route = safePath.toLowerCase().replace(/\/+$/, '') || '/';

  // ROUTE: Direct Android APK Download (Redirect to canonical named file)
  if (route === '/download/android' || route === '/download/apk') {
    res.writeHead(302, { 'Location': '/downloads/MusenixMusical-1.0.0.apk' });
    res.end();
    return;
  }

  // ROUTE: Direct iOS IPA Download (Redirect to canonical named file)
  if (route === '/download/ios' || route === '/download/ipa' || route === '/download/ios-ipa') {
    res.writeHead(302, { 'Location': '/downloads/MusenixMusical-1.0.0.ipa' });
    res.end();
    return;
  }

  // ROUTE: iOS Apple Profile (.mobileconfig) Download
  if (route === '/download/ios-profile' || route === '/download/profile') {
    res.writeHead(302, { 'Location': '/downloads/musenix-musical.mobileconfig' });
    res.end();
    return;
  }

  // ROUTE: API Info
  if (route === '/api/info') {
    const apkPath = getApkFilePath();
    const apkExists = apkPath && fs.existsSync(apkPath);
    const apkStat = apkExists ? fs.statSync(apkPath) : null;

    const ipaPath = getIpaFilePath();
    const ipaExists = ipaPath && fs.existsSync(ipaPath);
    const ipaStat = ipaExists ? fs.statSync(ipaPath) : null;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      appName: 'MUSENIX Musical',
      version: '1.0.0',
      tagline: 'Feel The Music, Live The Moment.',
      platform: {
        android: {
          available: apkExists,
          downloadUrl: '/download/android',
          fileSize: apkStat ? (apkStat.size / (1024 * 1024)).toFixed(1) + ' MB' : '48.6 MB',
          lastUpdated: apkStat ? apkStat.mtime.toISOString() : new Date().toISOString(),
          minSdk: 'Android 7.0 (Nougat) +'
        },
        ios: {
          available: ipaExists,
          downloadUrl: '/download/ios',
          profileUrl: '/download/ios-profile',
          fileSize: ipaStat ? (ipaStat.size / (1024 * 1024)).toFixed(1) + ' MB' : '16.4 MB',
          lastUpdated: ipaStat ? ipaStat.mtime.toISOString() : new Date().toISOString(),
          minOs: 'iOS 14.0 +'
        }
      },
      status: 'online'
    }));
    return;
  }


  // STATIC FILE SERVING
  let filePath = path.join(PUBLIC_DIR, safePath === '/' ? 'index.html' : safePath);

  // If path is directory, look for index.html inside
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Alias fallbacks for download files if single file is kept
  if (!fs.existsSync(filePath)) {
    if (safePath.includes('MUSENIX-Musical-v1.0.0.apk')) {
      const alt = path.join(PUBLIC_DIR, 'downloads', 'musenix-musical-release.apk');
      if (fs.existsSync(alt)) filePath = alt;
    } else if (safePath.includes('MUSENIX-Musical-v1.0.0.ipa')) {
      const alt = path.join(PUBLIC_DIR, 'downloads', 'musenix-musical-release.ipa');
      if (fs.existsSync(alt)) filePath = alt;
    }
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // Fallback to index.html for SPA-style routing if needed
    filePath = path.join(PUBLIC_DIR, 'index.html');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - Halaman tidak ditemukan');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  // Support Range requests for media (audio preview)
  if (ext === '.apk') {
    res.setHeader('Content-Disposition', 'attachment; filename="MusenixMusical-1.0.0.apk"');
    res.setHeader('Cache-Control', 'no-cache');
  } else if (ext === '.ipa') {
    res.setHeader('Content-Disposition', 'attachment; filename="MusenixMusical-1.0.0.ipa"');
    res.setHeader('Cache-Control', 'no-cache');
  } else if (ext === '.mobileconfig') {
    res.setHeader('Content-Disposition', 'attachment; filename="musenix-musical.mobileconfig"');
    res.setHeader('Cache-Control', 'no-cache');
  }

  if (range && (ext === '.mp3' || ext === '.m4a' || ext === '.apk')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

    if (start >= stat.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      return res.end();
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': (ext === '.html' || ext === '.css' || ext === '.js') ? 'no-cache' : 'public, max-age=86400',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🎵 MUSENIX Musical - Web Server Berjalan Aktif!`);
  console.log(`🌐 Akses Website : http://localhost:${PORT}`);
  console.log(`🤖 Download Android: http://localhost:${PORT}/download/android`);
  console.log(`🍏 Download iOS    : http://localhost:${PORT}/download/ios`);
  console.log(`=======================================================`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nMematikan server MUSENIX...');
  server.close(() => process.exit(0));
});
