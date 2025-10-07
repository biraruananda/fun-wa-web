# 🤖 WhatsApp Multi-Command Bot

Bot WhatsApp serbaguna berbasis **Node.js** dengan fitur AI Chat, Sticker, Downloader, Translate, dan lainnya.  
Dibangun menggunakan **whatsapp-web.js**, **OpenAI API**, dan beberapa library pendukung.

---

## ✨ Fitur Utama
| Command | Deskripsi |
|----------|------------|
| `.ai <prompt>` | Chat dengan AI (OpenAI compatible API) |
| `.ais <prompt>` | Mode singkat AI (tanpa konteks tambahan) |
| `.s` / `.sticker` | Buat stiker dari gambar |
| `.ss <text>` | Buat stiker dengan teks (caption wajib) |
| `.sgif` | Ubah video/GIF jadi stiker animasi |
| `.img <prompt>` | Generate gambar dari teks (AI image generator) |
| `.tl <text>` | Translate teks (otomatis deteksi bahasa) |
| `.quotes` | Dapatkan kutipan acak |
| `.ping` | Cek kecepatan respon bot |
| `.menu` | Tampilkan daftar command |
| `.tagall [pesan]` | Mention semua member grup |
| `.ytmp3 <url>` | Download audio YouTube |
| `.ytmp4 <url>` | Download video YouTube |
| `.jokes` / `.dadjokes` | Kirim lelucon acak yang ringan |

---

## ⚙️ Instalasi

### 1. Clone repository
```bash
git clone https://github.com/username/whatsapp-bot.git
cd whatsapp-bot
2. Install dependencies
bash
Copy code
npm install
3. Buat file .env
Isi dengan API key kamu:

env
Copy code
LLM7_API_KEY=your_openai_api_key
LLM7_BASE_URL=https://api.openai.com/v1
4. Jalankan bot
bash
Copy code
npm start
Atau:

bash
Copy code
node index.js
Saat pertama kali dijalankan, scan QR Code yang muncul di terminal untuk login WhatsApp.

📁 Struktur Direktori
pgsql
Copy code
whatsapp-bot/
├── assets/
│   └── author.png
├── command/
│   ├── aicom.js
│   ├── tagall.js
│   ├── sticker.js
│   ├── stickwithtext.js
│   ├── ping.js
│   ├── quotes.js
│   ├── imggen.js
│   ├── translate.js
│   ├── jokes.js
│   ├── ytmp3.js
│   └── ytmp4.js
├── .gitignore
├── ai_log.txt
├── index.js
├── package.json
└── README.md
🧠 Tentang AI Chat
Bot ini mendukung chat berbasis OpenAI API.
Pesan dari pengguna disaring, dan hanya output AI yang disimpan ke file ai_log.txt.

Format penyimpanan:

csharp
Copy code
[07/10/2025, 12:31:45] Jawaban AI...
🔒 File yang Diabaikan (.gitignore)
gitignore
Copy code
node_modules/
temp_*
session/
ai_log.txt
.env
🧩 Dependensi Utama
whatsapp-web.js

openai

ytdl-core

dotenv

qrcode-terminal

sharp

💡 Catatan Tambahan
File sementara (misalnya hasil download YouTube) disimpan sebagai temp_xxx.* dan otomatis dihapus setelah dikirim.

Bot ini belum mendukung multi-device login bersamaan.

Gunakan API key yang valid dan jangan dibagikan ke publik.

🧑‍💻 Kontributor
Bilal Ananda — Developer & Maintainer

“Keep it simple, keep it clean.”

📜 Lisensi
MIT License © 2025 Bilal Ananda

yaml
Copy code

---
