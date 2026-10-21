# BCA Auto Finance Flow

Buatkan saya aplikasi web Single Page Application (SPA) untuk sistem pengajuan kredit kendaraan bermotor (BCA Finance). Aplikasi ini berfokus pada fungsionalitas dan alur bisnis penuh (End-to-End), tidak perlu responsif untuk mobile (cukup desktop view yang rapi), dan gunakan desain UI korporat (dominasi warna Biru BCA dan Putih).

Gunakan dummy state/local storage untuk menyimpan data pengajuan agar aplikasinya bisa di-demo-kan antar role secara langsung.

1. SISTEM LOGIN DUMMY (ROLE SWITCHER)
Di bagian atas (header) halaman, buatkan dropdown "Login As" untuk berganti peran tanpa password. Role yang tersedia:
- Sales Dealer
- Pembeli
- Marketing
- Atasan Marketing
- Admin Backoffice

2. ALUR STATUS PENGAJUAN (STATE MACHINE)
Setiap pengajuan memiliki status yang berubah sesuai aksi role:
"Draft Dealer" -> "Menunggu ACC Pembeli" -> "Menunggu Submit Marketing" -> "Menunggu Approval Atasan" -> "Menunggu Upload TTD" -> "Menunggu Final ACC Marketing" -> "Selesai (Pencairan)"

3. TAMPILAN & FITUR BERDASARKAN ROLE (DASHBOARD)

A. Dashboard Sales Dealer:
- Menampilkan tabel daftar pengajuan yang dibuatnya.
- Tombol "Buat Pengajuan Baru": Membuka modal/form berisi input Nama Konsumen, serta tombol dummy upload untuk KTP, SPK, dan Bukti Bayar Tanda Jadi. 
- Jika disubmit, status berubah menjadi "Menunggu ACC Pembeli".

B. Dashboard Pembeli:
- Menampilkan tabel pengajuan atas namanya.
- Jika status "Menunggu ACC Pembeli": Ada tombol "Lihat Data & ACC". Jika di-klik, status berubah menjadi "Menunggu Submit Marketing".
- Jika status "Menunggu Upload TTD": Ada tombol "Upload TTD". Jika di-klik (dummy upload), merubah state menjadi sudah upload.

C. Dashboard Marketing:
- Menampilkan tabel semua pengajuan.
- Jika status "Menunggu Submit Marketing": Ada tombol "Lengkapi Data". Membuka form kompleks berisi: Data Konsumen (NIK, Tgl Lahir, Status), Data Kendaraan (Merk, Tipe, Warna, Harga), Data Pinjaman (DP, Tenor, Asuransi). Jika disubmit, status menjadi "Menunggu Approval Atasan".
- Jika status pengajuan "Menunggu Final ACC Marketing" (artinya pembeli dan dealer sudah upload TTD): Ada tombol "Final ACC Dokumen". Jika diklik, status menjadi "Selesai (Pencairan)".

D. Dashboard Atasan Marketing:
- Menampilkan tabel pengajuan dengan status "Menunggu Approval Atasan".
- Ada tombol "Review". Menampilkan seluruh data yang diisi Marketing.
- Terdapat tombol "Approve" (mengubah status menjadi "Menunggu Upload TTD" dan sistem men-generate dummy Dokumen PO) dan "Reject".

E. Dashboard Admin Backoffice:
- Menampilkan tabel pengajuan dengan status akhir "Selesai (Pencairan)".
- Terdapat tombol "Lihat Dokumen PO" (menampilkan modal berisi text dummy dokumen persetujuan) dan tombol "Eksekusi Pencairan Dana" yang akan mengubah baris tersebut menjadi warna hijau (Tercairkan).

Gunakan komponen UI modern (Card, Table, Modal, Button) yang rapi. Buatkan satu dummy data awal agar ketika aplikasi dirender pertama kali, tabel tidak sepenuhnya kosong.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/52f203a0-0141-4c74-a7fb-32e34753b8bd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
