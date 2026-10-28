# 🖼️ docs/screenshots/

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

Tangkapan layar prototipe web DR-VERGE yang dipakai di README utama. Setiap gambar tersedia dalam dua bahasa antarmuka:

```text
docs/screenshots/
├── id/    antarmuka Bahasa Indonesia  → dipakai di README.md
└── en/    antarmuka English           → dipakai di README.en.md
```

| Berkas | Isi |
|---|---|
| `hero-light-dark.webp` | Banner: Beranda dengan mode terang (kiri) dan gelap (kanan) |
| `hero-light.webp` · `hero-dark.webp` | Beranda, palet _Colorful_ |
| `hero-mono-light.webp` · `hero-mono-dark.webp` | Beranda, palet Monokrom |
| `home-<bagian>-<mode>.webp` | Bagian Beranda: `problem`, `two-views`, `csd`, `pipeline`, `findings`, `rq1`, `rq2`, `sdg`, `team` |
| `demo-upload-light.webp` | Demo, langkah 1 — memilih pasangan _dual-view_ |
| `demo-result-light.webp` · `demo-result-dark.webp` | Demo, langkah 3 — hasil inferensi sungguhan (sampel p24-R) |
| `demo-detail-light.webp` | Detail hasil: skor ambang, skor per _grade_, perbandingan referensi |
| `research-*.webp` | Halaman Penelitian |
| `mobile-light.webp` · `mobile-dark.webp` | Tampilan seluler (390 × 844) |

**Cara dibuat:** Chrome _headless_ melalui Chrome DevTools Protocol, _viewport_ 1440 × 900 (seluler 390 × 844), `prefers-reduced-motion: reduce` agar animasi tampil pada keadaan akhirnya, format WebP. Hasil demo berasal dari model ONNX sungguhan yang berjalan di browser, bukan data tiruan.
