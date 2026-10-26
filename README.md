# ini_nama

Prototype dashboard operasional untuk UMKM keluarga: stok bahan, menu dengan resep, kasir yang otomatis mengurangi stok, pembukuan, laporan, dan e-struk WhatsApp.

## Jalanin

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
```

## Catatan prototype

Data disimpan di `localStorage` supaya demo bisa langsung dipakai tanpa akun maupun setup database. Tab yang terbuka dalam browser yang sama ikut diperbarui lewat `BroadcastChannel`.

Untuk versi lomba yang online dan sinkron antar-HP, ganti lapisan penyimpanan di `src/App.tsx` dengan API Node.js dan database PostgreSQL/Supabase. Pengguna tetap cukup masuk memakai kode atau QR, tanpa membuat akun.
