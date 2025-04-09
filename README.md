# NubiZen - Prior Testnet Multi-Account Tool

## Fitur
- **Lihat Saldo**: Periksa saldo ETH, PRIOR, USDC, dan USDT untuk semua akun.
- **Klaim Faucet**: Klaim token PRIOR dari kontrak faucet untuk semua akun.
- **Swap Otomatis**: Swap token PRIOR ke USDC atau USDT untuk satu atau semua akun.
- **Logging Detail**: Log aktivitas dengan timestamp dan warna untuk memudahkan debugging.
- **Menu Interaktif**: Antarmuka berbasis CLI yang mudah digunakan.

## Prasyarat
- **Node.js**: Versi 16 atau lebih tinggi.
- **npm**: Untuk menginstal dependensi.
- **File `.env`**: Untuk konfigurasi RPC URL.
- **File `private_keys.txt`**: Untuk menyimpan kunci privat akun.

## Instalasi
1. **https://github.com/nubizen/prior.git**
   ```bash
   git clone <https://github.com/nubizen/prior.git>
   cd <prior>
   ```
## Instal Dependensi:
```bash
npm init -y
npm install ethers dotenv
```
## Konfigurasi Lingkungan:
Buat file .env di folder yang sama :
isi dengan ini 
```bash
RPC_URL=https://sepolia.base.org
```

## Tambahkan Kunci Privat:
```bash
Buat file private_keys.txt di root proyek.
Tambahkan kunci privat, satu per baris. Contoh:
0x1234...abcd
0x5678...efgh
```
## Jalankan Program:
```bash
node index.js
Menu Utama:
Setelah dijalankan, Anda akan melihat menu berikut:
```
N U B I Z E N
| Prior Testnet Multi-Account Tool |
| Powered by Blockchain Innovation |
[timestamp] Menggunakan jaringan: PRIOR TESTNET
Pilihan Menu (PRIOR TESTNET):
1 - Lihat Saldo Semua Akun         | 5 - Muat Ulang Private Key
2 - Klaim Faucet Semua Akun        | 6 - Hentikan Proses
3 - Swap Otomatis Semua Akun       | 7 - Keluar
4 - Swap Akun Spesifik            |
Pilih nomor menu (1-7):
Ketik angka dari 1 hingga 7 untuk memilih opsi.
Opsi Menu:
1: Menampilkan saldo ETH, PRIOR, USDC, dan USDT untuk semua akun.
2: Mengklaim token PRIOR dari faucet untuk semua akun.
3: Melakukan swap otomatis untuk semua akun ( Anda akan diminta memasukkan jumlah swap per akun).
4: Melakukan swap untuk akun tertentu (pilih nomor akun dan jumlah swap).
5: Memuat ulang kunci privat dari private_keys.txt.
6: Menghentikan proses swap yang sedang berjalan.
7: Keluar dari program.
Contoh Swap:
Pilih opsi "3", masukkan "1" untuk 1 swap per akun:
Masukkan jumlah swap per akun: 1
[timestamp] Memulai swap untuk 5 akun, 1 swap per akun
[timestamp] Akun 1: Memulai 1 siklus swap
[timestamp] Akun 1: Saldo ETH: 0.1416, PRIOR: 1.00
[timestamp] Akun 1: Allowance saat ini: 0.05 PRIOR
[timestamp] Akun 1: Swap 0.005000 PRIOR ke USDC, calldata: 0xf3b68002...
[timestamp] Akun 1: TX swap dikirim: 0xcb64...0af4
[timestamp] Akun 1: Swap ke USDC sukses (1/1)
[timestamp] Akun 1: Operasi swap selesai
Konfigurasi Kontrak
USDC: 0x109694D75363A75317A8136D80f50F871E81044e
USDT: 0x014397DaEa96CaC46DbEdcbce50A42D5e0152B2E
PRIOR: 0xc19Ec2EEBB009b2422514C51F9118026f1cD89ba
Swap Router: 0x0f1DADEcc263eB79AE3e4db0d57c49a8b6178B0B
Faucet: 0xCa602D9E45E1Ed25105Ee43643ea936B8e2Fd6B7
Catatan Penting
Gas Limit: Transaksi approval menggunakan 200,000 gas, sedangkan swap menggunakan 500,000 gas.
Jeda Acak: Swap memiliki jeda acak antara 5-15 detik untuk menghindari rate limiting.
Error Handling: Jika swap gagal, program akan mencatat error dan melanjutkan ke siklus berikutnya.
Testnet: Pastikan Anda menggunakan jaringan Prior Testnet dan memiliki cukup ETH untuk gas.
Debugging
Log mencakup timestamp dan kategori (info, system, success, error, warning, prior) dengan warna berbeda.
Jika transaksi gagal, periksa log untuk detail seperti saldo, allowance, atau calldata.
Contoh error:
[timestamp] Akun 1: Error swap: transaction execution reverted
[timestamp] Akun 1: Data TX: {"to":"0x0f1DADE...","from":"0x48ADa1...","data":"0xf3b68002..."}
[timestamp] Akun 1: Receipt: {"status":0,...}
Kontribusi
Silakan fork dan buat pull request untuk perbaikan atau fitur baru.
Laporkan masalah di bagian Issues jika ada bug.
Lisensi
Proyek ini tidak memiliki lisensi resmi dan dibuat untuk keperluan pengujian di Prior Testnet.# prior
