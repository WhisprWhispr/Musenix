# 🎵 MUSENIX Musical - Official Landing Page

Website resmi modern, responsif, dan mobile-friendly untuk **MUSENIX Musical** yang dibangun menggunakan **Node.js**.

---

## 🚀 Fitur Utama Website

1. **Dual Category Download**:
   - 🤖 **Android (APK Langsung)**: Download langsung berkas `MusenixMusical-1.0.0.apk` (85.9 MB), panduan instalasi 3 langkah, info spesifikasi minimum (Android 7.0+), dan QR Code scanner untuk download langsung di HP.
   - 🍏 **iOS (IPA & WebClip)**: Berkas biner `MusenixMusical-1.0.0.ipa` (15.0 MB) untuk sideloading, serta profil WebClip `.mobileconfig` instan via Safari (*Add to Home Screen*).
2. **Interactive Live Audio Player Preview**:
   - Pemutar lagu interaktif langsung di halaman web dengan equalizer gelombang suara animasi (*live waveform*), seekbar, kontrol play/pause, dan pergantian lagu contoh (*Nadhif Basalamah - Penjaga Hati* & *Tulus - Hati-Hati di Jalan*).
3. **Desain Modern & Profesional**:
   - Tema gelap futuristik (*Dark Neon Theme* `#080810`, `#8B2BFF`, `#D82CFF`, `#00E5FF`).
   - Glassmorphism UI, glow effects, badge status online, dan mobile drawer menu.
   - 100% responsif di layar Smartphone, Tablet, Laptop, maupun Monitor Desktop 4K.
4. **Fitur Showcase & Komparasi**:
   - 6 kartu fitur unggulan MUSENIX (Full Audio Stream, Tanpa Iklan, Realtime Lyrics, Offline Download, Smart Cache, Background Play).
   - Tabel komparasi MUSENIX vs Layanan Musik Konvensional.
   - Accordion FAQ interaktif.
5. **Zero External Dependencies**:
   - Server Node.js berjalan murni menggunakan modul bawaan (`http`, `fs`, `path`), tanpa perlu `npm install` library berat. Ringan, cepat, dan hemat resource.

---

## 💻 Cara Menjalankan Website

Buka terminal di folder project dan jalankan perintah:

```bash
cd website
node server.js
```
atau menggunakan npm:
```bash
cd website
npm start
```

Website akan aktif di:
👉 **http://localhost:3000**

---

## 🌐 Endpoint & Rute URL

- `GET /` : Halaman landing page MUSENIX Musical
- `GET /download/android` : Download otomatis berkas APK Android (`MusenixMusical-1.0.0.apk`)
- `GET /download/ios` : Download otomatis berkas IPA iOS (`MusenixMusical-1.0.0.ipa`)
- `GET /download/ios-profile` : Unduh profil konfigurasi iOS WebClip (`musenix-musical.mobileconfig`)
- `GET /api/info` : Endpoint status API informasi aplikasi (versi, ukuran berkas, status)
- `GET /audio/*` : Streaming audio preview dengan dukungan HTTP Range Request (206 Partial Content)

