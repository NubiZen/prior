import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import readline from "readline";

// Konfigurasi dasar
const rpcEndpoint = process.env.RPC_URL || "https://rpc.prior-testnet.com";
const keyFilePath = process.env.KEYS_FILE || "./private_keys.txt";
const tokenUSDC = "0x109694D75363A75317A8136D80f50F871E81044e";
const tokenUSDT = "0x014397DaEa96CaC46DbEdcbce50A42D5e0152B2E";
const tokenPrior = "0xc19Ec2EEBB009b2422514C51F9118026f1cD89ba";
const swapRouter = "0x0f1DADEcc263eB79AE3e4db0d57c49a8b6178B0B";
const faucetContract = "0xCa602D9E45E1Ed25105Ee43643ea936B8e2Fd6B7";
const networkLabel = "PRIOR TESTNET";

// Definisi ABI
const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const routerABI = [
  {
    inputs: [{ internalType: "uint256", name: "varg0", type: "uint256" }],
    name: "swapPriorToUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "varg0", type: "uint256" }],
    name: "swapPriorToUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const faucetABI = [
  "function claimTokens() external",
  "function lastClaimTime(address) view returns (uint256)",
  "function claimCooldown() view returns (uint256)",
];

// State aplikasi
let accountList = [];
let stopFlag = false;

const inputInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fungsi utilitas
const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const truncateTxHash = (tx) => `${tx.slice(0, 6)}...${tx.slice(-4)}`;
const randomWait = () => Math.floor(Math.random() * (15000 - 5000) + 5000);

// Fungsi logging
const printLog = (text, level = "info") => {
  const timeNow = new Date().toLocaleTimeString();
  const logStyles = {
    info: "\x1b[37m",
    system: "\x1b[1;37m",
    success: "\x1b[1;32m",
    error: "\x1b[1;31m",
    warning: "\x1b[1;33m",
    prior: "\x1b[1;35m",
  };
  const reset = "\x1b[0m";
  const style = logStyles[level] || logStyles.info;
  console.log(`[${timeNow}] ${style}${text}${reset}`);
};

// Membaca kunci privat
const fetchKeys = () => {
  try {
    if (!fs.existsSync(keyFilePath)) {
      fs.writeFileSync(
        keyFilePath,
        "# Masukkan private key di sini, satu per baris\n# Baris dengan # akan diabaikan\n"
      );
      printLog(`File kunci baru dibuat di ${keyFilePath}`, "system");
      return [];
    }

    const fileData = fs.readFileSync(keyFilePath, "utf8");
    const keyArray = fileData
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k && !k.startsWith("#") && ethers.isHexString(k, 32));

    if (!keyArray.length) printLog("Tidak ada kunci valid di file", "warning");
    return keyArray;
  } catch (err) {
    printLog(`Gagal membaca kunci: ${err.message}`, "error");
    return [];
  }
};

// Inisialisasi akun tanpa langsung refresh saldo
const setupAccounts = async () => {
  if (!rpcEndpoint) {
    printLog("RPC_ENDPOINT belum diset di .env", "error");
    return false;
  }

  const chainProvider = new ethers.JsonRpcProvider(rpcEndpoint);
  const keys = fetchKeys();

  if (!keys.length) {
    printLog("Tidak ada kunci privat valid, tambahkan ke file kunci", "error");
    return false;
  }

  printLog(`Memuat ${keys.length} akun...`, "system");
  accountList = [];

  for (const privKey of keys) {
    try {
      const wallet = new ethers.Wallet(privKey, chainProvider);
      accountList.push({
        key: privKey,
        addr: wallet.address,
        eth: "0.00",
        prior: "0.00",
        usdc: "0.00",
        usdt: "0.00",
      });
    } catch (err) {
      printLog(`Kunci tidak valid: ${err.message}`, "error");
    }
  }

  if (!accountList.length) {
    printLog("Tidak ada akun yang bisa dimuat", "error");
    return false;
  }

  printLog("Akun berhasil dimuat", "success");
  return true;
};

// Refresh data akun
const refreshAccount = async (idx) => {
  if (idx >= accountList.length) return null;

  const acc = accountList[idx];
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const signer = new ethers.Wallet(acc.key, provider);

  try {
    const balances = await Promise.all([
      provider.getBalance(signer.address),
      new ethers.Contract(tokenPrior, tokenABI, provider).balanceOf(signer.address),
      new ethers.Contract(tokenUSDC, tokenABI, provider).balanceOf(signer.address),
      new ethers.Contract(tokenUSDT, tokenABI, provider).balanceOf(signer.address),
    ]);

    acc.eth = ethers.formatEther(balances[0]);
    acc.prior = ethers.formatEther(balances[1]);
    acc.usdc = ethers.formatUnits(balances[2], 6);
    acc.usdt = ethers.formatUnits(balances[3], 6);

    return acc;
  } catch (err) {
    printLog(`Gagal refresh akun ${idx + 1}: ${err.message}`, "error");
    return null;
  }
};

const refreshAllBalances = async () => {
  printLog(`Memperbarui data untuk ${accountList.length} akun...`, "system");
  const refreshTasks = accountList.map((_, i) => refreshAccount(i));
  const updated = await Promise.all(refreshTasks);

  updated.forEach((acc, i) => {
    if (acc) {
      printLog(
        `Akun ${i + 1}: ${truncateAddress(acc.addr)} | ETH: ${Number(acc.eth).toFixed(4)} | PRIOR: ${Number(acc.prior).toFixed(2)} | USDC: ${Number(acc.usdc).toFixed(2)} | USDT: ${Number(acc.usdt).toFixed(2)}`,
        "info"
      );
    }
  });
  printLog("Semua data akun diperbarui", "success");
};

// Klaim dari faucet
const requestFaucet = async (idx) => {
  const acc = accountList[idx];
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(acc.key, provider);
  const faucet = new ethers.Contract(faucetContract, faucetABI, wallet);

  try {
    const [lastTime, waitPeriod] = await Promise.all([
      faucet.lastClaimTime(wallet.address),
      faucet.claimCooldown(),
    ]);

    const nextAvailable = Number(lastTime) + Number(waitPeriod);
    const now = Math.floor(Date.now() / 1000);

    if (now < nextAvailable) {
      const timeLeft = nextAvailable - now;
      const hrs = Math.floor(timeLeft / 3600);
      const mins = Math.floor((timeLeft % 3600) / 60);
      printLog(`Akun ${idx + 1}: Harus menunggu ${hrs}j ${mins}m`, "warning");
      return false;
    }

    printLog(`Akun ${idx + 1}: Mengambil token PRIOR...`, "system");
    const txResponse = await faucet.claimTokens({ gasLimit: 300000 });
    printLog(`Akun ${idx + 1}: TX dikirim: ${truncateTxHash(txResponse.hash)}`, "warning");

    const txResult = await txResponse.wait();
    if (txResult.status === 1) {
      printLog(`Akun ${idx + 1}: Klaim berhasil`, "success");
      await refreshAccount(idx);
      return true;
    }
    printLog(`Akun ${idx + 1}: Klaim gagal`, "error");
    return false;
  } catch (err) {
    printLog(`Akun ${idx + 1}: Error klaim: ${err.message}`, "error");
    return false;
  }
};

const claimForAll = async () => {
  printLog(`Mencoba klaim faucet untuk ${accountList.length} akun`, "system");
  let successTotal = 0;

  for (let i = 0; i < accountList.length; i++) {
    if (await requestFaucet(i)) successTotal++;
    await new Promise((r) => setTimeout(r, 3000));
  }

  printLog(`Selesai klaim untuk ${successTotal}/${accountList.length} akun`, "system");
};

// Fungsi swap dengan pendekatan dari kode referensi
const performSwap = async (accIdx, swapTimes) => {
  const acc = accountList[accIdx];
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(acc.key, provider);
  const priorContract = new ethers.Contract(tokenPrior, tokenABI, wallet);

  printLog(`Akun ${accIdx + 1}: Memulai ${swapTimes} siklus swap`, "prior");

  const ethBal = ethers.formatEther(await provider.getBalance(wallet.address));
  const priorBal = await priorContract.balanceOf(wallet.address);
  const priorAmount = ethers.formatEther(priorBal);
  printLog(`Akun ${accIdx + 1}: Saldo ETH: ${ethBal}, PRIOR: ${priorAmount}`, "system");

  if (Number(ethBal) < 0.001) {
    printLog(`Akun ${accIdx + 1}: Saldo ETH tidak cukup untuk gas`, "error");
    return false;
  }
  if (Number(priorAmount) <= 0) {
    printLog(`Akun ${accIdx + 1}: Saldo PRIOR tidak cukup untuk swap`, "error");
    return false;
  }

  for (let cycle = 1; cycle <= swapTimes && !stopFlag; cycle++) {
    const toUSDC = cycle % 2 === 1;
    const functionSelector = toUSDC ? "0xf3b68002" : "0x03b530a3"; // Dari kode referensi
    const target = toUSDC ? "USDC" : "USDT";
    const swapQty = Math.min(0.005, Number(priorAmount) * 0.8);
    const swapWei = ethers.parseEther(swapQty.toFixed(6));

    try {
      // Approve token
      const allowance = await priorContract.allowance(wallet.address, swapRouter);
      printLog(`Akun ${accIdx + 1}: Allowance saat ini: ${ethers.formatEther(allowance)} PRIOR`, "info");

      if (allowance < swapWei) {
        printLog(`Akun ${accIdx + 1}: Menyetujui ${swapQty.toFixed(6)} PRIOR`, "prior");
        const approveTx = await priorContract.approve(swapRouter, swapWei, { gasLimit: 200000 });
        printLog(`Akun ${accIdx + 1}: Approval dikirim: ${truncateTxHash(approveTx.hash)}`, "prior");
        const approveReceipt = await approveTx.wait();
        if (approveReceipt.status !== 1) {
          printLog(`Akun ${accIdx + 1}: Approval gagal`, "error");
          continue;
        }
        printLog(`Akun ${accIdx + 1}: Approval berhasil`, "success");
      }

      // Encode data transaksi secara manual
      const paramHex = ethers.zeroPadValue(ethers.toBeHex(swapWei), 32);
      const txData = functionSelector + paramHex.slice(2);
      printLog(`Akun ${accIdx + 1}: Swap ${swapQty.toFixed(6)} PRIOR ke ${target}, calldata: ${txData}`, "prior");

      // Kirim transaksi swap
      const swapTx = await wallet.sendTransaction({
        to: swapRouter,
        data: txData,
        gasLimit: 500000,
      });
      printLog(`Akun ${accIdx + 1}: TX swap dikirim: ${truncateTxHash(swapTx.hash)}`, "warning");

      const result = await swapTx.wait();
      if (result.status === 1) {
        printLog(`Akun ${accIdx + 1}: Swap ke ${target} sukses (${cycle}/${swapTimes})`, "success");
        if (cycle % 3 === 0 || cycle === swapTimes) await refreshAccount(accIdx);
      } else {
        printLog(`Akun ${accIdx + 1}: Swap gagal, status: ${result.status}`, "error");
      }
    } catch (err) {
      printLog(`Akun ${accIdx + 1}: Error swap: ${err.message}`, "error");
      if (err.transaction) printLog(`Akun ${accIdx + 1}: Data TX: ${JSON.stringify(err.transaction)}`, "error");
      if (err.receipt) printLog(`Akun ${accIdx + 1}: Receipt: ${JSON.stringify(err.receipt)}`, "error");
      continue;
    }

    if (cycle < swapTimes && !stopFlag) {
      const pause = randomWait();
      printLog(`Akun ${accIdx + 1}: Tunggu ${Math.floor(pause / 1000)} detik`, "prior");
      await new Promise((r) => setTimeout(r, pause));
    }
  }

  printLog(`Akun ${accIdx + 1}: Operasi swap selesai`, "prior");
  return true;
};

const swapAllAccounts = async (swapPerAcc) => {
  if (!accountList.length) {
    printLog("Tidak ada akun tersedia", "error");
    return;
  }

  stopFlag = false;
  printLog(`Memulai swap untuk ${accountList.length} akun, ${swapPerAcc} swap per akun`, "system");

  for (let i = 0; i < accountList.length && !stopFlag; i++) {
    await performSwap(i, swapPerAcc);
    if (i < accountList.length - 1) {
      const delay = 2000 + Math.random() * 2000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  printLog("Semua operasi swap selesai", "success");
};

// Tampilan menu tanpa logo
const displayMenu = () => {
  console.log(`
   Pilihan Menu (${networkLabel}):
   1 - Lihat Saldo Semua Akun         | 5 - Muat Ulang Private Key
   2 - Klaim Faucet Semua Akun        | 6 - Hentikan Proses
   3 - Swap Otomatis Semua Akun       | 7 - Keluar
   4 - Swap Akun Spesifik            |
   ---------------------------------
  `);

  inputInterface.question("Pilih nomor menu (1-7): ", async (input) => {
    const choice = input.trim();
    if (choice === "1") {
      await refreshAllBalances();
      displayMenu();
    } else if (choice === "2") {
      await claimForAll();
      displayMenu();
    } else if (choice === "3") {
      inputInterface.question("Masukkan jumlah swap per akun: ", async (num) => {
        const swapCount = parseInt(num);
        if (isNaN(swapCount) || swapCount <= 0) {
          printLog("Jumlah swap harus angka positif", "error");
        } else {
          await swapAllAccounts(swapCount);
        }
        displayMenu();
      });
    } else if (choice === "4") {
      if (!accountList.length) {
        printLog("Tidak ada akun yang tersedia", "error");
        displayMenu();
        return;
      }
      console.log("\nDaftar Akun Tersedia:");
      accountList.forEach((acc, idx) => {
        console.log(`  ${idx + 1}. ${truncateAddress(acc.addr)} | PRIOR: ${Number(acc.prior).toFixed(2)}`);
      });
      inputInterface.question("Pilih nomor akun: ", (accNum) => {
        const accIdx = parseInt(accNum) - 1;
        if (isNaN(accIdx) || accIdx < 0 || accIdx >= accountList.length) {
          printLog("Akun yang dipilih tidak valid", "error");
          displayMenu();
          return;
        }
        inputInterface.question("Berapa kali swap? ", async (num) => {
          const swapCount = parseInt(num);
          if (isNaN(swapCount) || swapCount <= 0) {
            printLog("Masukkan jumlah swap yang valid", "error");
          } else {
            await performSwap(accIdx, swapCount);
          }
          displayMenu();
        });
      });
    } else if (choice === "5") {
      await setupAccounts();
      displayMenu();
    } else if (choice === "6") {
      stopFlag = true;
      printLog("Menghentikan semua proses aktif...", "warning");
      displayMenu();
    } else if (choice === "7") {
      printLog("Program ditutup", "system");
      inputInterface.close();
      process.exit(0);
    } else {
      printLog("Pilih hanya dari nomor 1 sampai 7", "error");
      displayMenu();
    }
  });
};

// Mulai aplikasi dengan logo hanya di awal
(async () => {
  console.log(`
   ---------------------------------
   | Prior Testnet Multi-Account Tool |
   | Develop by NubiZen               |
   ---------------------------------
  `);
  printLog(`Menggunakan jaringan: ${networkLabel}`, "system");

  if (!(await setupAccounts())) {
    printLog(`Tambahkan private key ke ${keyFilePath} dan mulai ulang`, "error");
    process.exit(1);
  }

  displayMenu();
})();