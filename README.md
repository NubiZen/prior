# NubiZen - Prior Testnet Multi-Account Tool

Alat CLI multi-akun untuk berinteraksi dengan Prior Testnet. Cocok buat automation klaim faucet, cek saldo, dan swap token PRIOR ke USDC/USDT.

---

## Fitur

- **Lihat Saldo**: Cek saldo ETH, PRIOR, USDC, dan USDT semua akun.
- **Klaim Faucet**: Klaim token PRIOR secara otomatis dari faucet.
- **Swap Otomatis**: Tukar token PRIOR ke USDC atau USDT untuk satu atau semua akun.
- **Logging Detail**: Log dengan timestamp dan warna memudahkan debugging.
- **Menu Interaktif**: CLI interaktif yang mudah dipahami.

---

## Prasyarat

- **Node.js** v16 atau lebih tinggi
- **npm**
- File `.env` untuk konfigurasi RPC
- File `private_keys.txt` berisi kunci privat akun (satu per baris)

---

## Instalasi

### 1. Clone Repositori

```bash
git clone https://github.com/nubizen/prior.git
cd prior
```

### 2. Instal Dependensi

```bash
npm init -y
npm install ethers dotenv
```

### 3. Konfigurasi `.env`

Buat file `.env` di root folder dan isi:

```
RPC_URL=https://sepolia.base.org
```

### 4. Tambahkan Kunci Privat

Buat file `private_keys.txt` di direktori root. Tambahkan kunci privat (tanpa spasi), satu per baris:

```
0x1234...abcd
0x5678...efgh
```

---

## Menjalankan Program

```bash
node index.js
```

---

## Menu CLI

```
| Prior Testnet Multi-Account Tool |
| Develop by NubiZen               |
[timestamp] Menggunakan jaringan: PRIOR TESTNET

1 - Lihat Saldo Semua Akun
2 - Klaim Faucet Semua Akun
3 - Swap Otomatis Semua Akun
4 - Swap Akun Spesifik
5 - Muat Ulang Private Key
6 - Hentikan Proses
7 - Keluar
```

---

## Contoh: Swap Otomatis

Pilih menu `3`, lalu masukkan jumlah swap per akun (misal: `1`):

```
[timestamp] Memulai swap untuk 5 akun, 1 swap per akun
[timestamp] Akun 1: Swap 0.005 PRIOR ke USDC
[timestamp] Akun 1: TX berhasil: 0xcb64...0af4
```

---

## Kontrak Penting

| Token | Alamat |
|-------|--------|
| USDC | `0x109694D75363A75317A8136D80f50F871E81044e` |
| USDT | `0x014397DaEa96CaC46DbEdcbce50A42D5e0152B2E` |
| PRIOR | `0xc19Ec2EEBB009b2422514C51F9118026f1cD89ba` |
| Router | `0x0f1DADEcc263eB79AE3e4db0d57c49a8b6178B0B` |
| Faucet | `0xCa602D9E45E1Ed25105Ee43643ea936B8e2Fd6B7` |

---

## Catatan Teknis

- **Gas Limit**:
  - Approval: `200,000`
  - Swap: `500,000`
- **Delay Acak Swap**: 5â€“15 detik per akun untuk menghindari rate limiting.
- **Error Handling**: Swap gagal akan dicatat dan program lanjut ke akun berikutnya.
- **Pastikan** Anda punya ETH cukup di setiap akun untuk biaya gas.

---

## Debugging & Logging

Log mencakup detail lengkap dengan kategori dan warna:

```
[timestamp] Akun 1: Error swap: transaction execution reverted
[timestamp] Akun 1: Data TX: {...}
[timestamp] Akun 1: Receipt: {"status":0,...}
```

---

## Kontribusi

- Fork dan buat pull request untuk fitur baru atau perbaikan.
- Laporkan bug lewat [Issues](https://github.com/nubizen/prior/issues).


---

> Develop by NubiZen - For testing, learning, and fun.