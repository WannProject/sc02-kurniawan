# Antrian Tiket Support

Aplikasi antrian tiket support berbasis Laravel 13, React, Inertia, MySQL, dan database queue. Sistem ini menangani pembuatan tiket, auto assignment ke agent, state machine status, audit trail, percakapan tiket, dan notifikasi email asynchronous.

## Fitur Utama

- User membuat tiket dengan judul, deskripsi, dan prioritas.
- Tiket otomatis di-assign ke agent aktif dengan beban kerja paling rendah.
- Status tiket dikontrol dengan alur valid: `open -> assigned -> in_progress -> resolved -> closed`.
- Setiap perubahan status dicatat ke audit trail.
- Email dikirim lewat queue agar request utama tetap cepat.
- Agent dan user dapat saling membalas di halaman detail tiket.
- Tersedia endpoint API sesuai PRD untuk membuat tiket dan melihat history.

## Kebutuhan Sistem

- PHP 8.3 atau lebih baru
- Composer
- Node.js dan npm
- MySQL 8 atau kompatibel
- Mail account SMTP untuk pengiriman email, contoh Gmail SMTP dengan Google App Password

## Instalasi

Clone repository, lalu install dependency:

```bash
composer install
npm install
```

Copy environment file:

```bash
cp .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

Atur koneksi database di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=antrian_tiket_app
DB_USERNAME=laravel
DB_PASSWORD=password
```

Jalankan migrasi dan seeder:

```bash
php artisan migrate --seed
```

Build atau jalankan frontend:

```bash
npm run dev
```

Jalankan server Laravel:

```bash
php artisan serve
```

Buka aplikasi:

```txt
http://localhost:8000
```

## Konfigurasi Seeder

Seeder menggunakan email dummy secara default agar aman untuk repository public.

Default di `.env.example`:

```env
SEED_USER_EMAIL=user@example.com
SEED_AGENT_EMAIL=agent@example.com
```

Untuk local development, boleh override di `.env` memakai email asli:

```env
SEED_USER_EMAIL=email-user-kamu@gmail.com
SEED_AGENT_EMAIL=email-agent-kamu@gmail.com
```

Seeder akan membuat:

| Role  | Nama       | Email               |
| ----- | ---------- | ------------------- |
| User  | User       | `SEED_USER_EMAIL`   |
| Agent | Agent User | `SEED_AGENT_EMAIL`  |
| Admin | Admin User | `admin@example.com` |

Password user hasil factory mengikuti konfigurasi factory project. Jika memakai default starter/factory, gunakan password default yang tersedia di factory project.

## Konfigurasi Email Gmail SMTP

Project ini memakai SMTP untuk email. Contoh konfigurasi Gmail:

```env
MAIL_MAILER=smtp
MAIL_SCHEME=null
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME="your-gmail-address@gmail.com"
MAIL_PASSWORD="your-google-app-password"
MAIL_FROM_ADDRESS="your-gmail-address@gmail.com"
MAIL_FROM_NAME="${APP_NAME}"
```

Catatan:

- `MAIL_PASSWORD` harus memakai Google App Password, bukan password login Gmail biasa.
- Akun Gmail perlu mengaktifkan 2-Step Verification terlebih dahulu.
- Jangan commit `.env` karena berisi credential.

Setelah mengubah `.env`, jalankan:

```bash
php artisan config:clear
```

## Queue Worker

Email dikirim lewat queue database. Karena itu worker wajib berjalan agar email benar-benar terkirim.

Jalankan worker:

```bash
php artisan queue:work
```

Jika worker tidak berjalan:

- tiket tetap dibuat;
- job email masuk ke tabel `jobs`;
- email belum masuk inbox sampai worker memproses job.

Untuk memproses satu job saja:

```bash
php artisan queue:work --once
```

Jika ada job gagal permanen, cek tabel `failed_jobs`, lalu retry:

```bash
php artisan queue:retry all
```

## Menjalankan Aplikasi Saat Development

Gunakan tiga terminal terpisah:

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

Terminal 3:

```bash
php artisan queue:work
```

## Alur Penggunaan Sistem

### 1. User Membuat Tiket

User login, masuk ke halaman ticket create, lalu mengisi:

- title
- description
- priority: `low`, `medium`, atau `high`

Setelah tiket dibuat:

1. status awal dibuat sebagai `open`;
2. sistem mencari agent aktif;
3. tiket diubah menjadi `assigned`;
4. audit trail mencatat `open -> assigned`;
5. email assignment dikirim ke agent melalui queue.

### 2. Agent Menangani Tiket

Agent login dan membuka detail tiket yang assigned.

Agent dapat:

- mengubah status dari `assigned` ke `in_progress`;
- membalas percakapan tiket;
- mengubah status dari `in_progress` ke `resolved`.

Saat agent membalas tiket, email dikirim ke user pembuat tiket.

### 3. User Membalas Tiket

User dapat membuka detail tiket dan menambahkan balasan.

Saat user membalas tiket, email dikirim ke agent yang assigned.

### 4. Tiket Diselesaikan

Saat agent/admin mengubah status tiket menjadi `resolved`, sistem mengirim email resolved ke user pembuat tiket.

### 5. Tiket Ditutup

Status `resolved` dapat diubah menjadi `closed` sesuai state machine.

## State Machine Status

Status yang tersedia:

```txt
open
assigned
in_progress
resolved
closed
```

Transisi valid:

```txt
open -> assigned
assigned -> in_progress
in_progress -> resolved
resolved -> closed
```

Contoh transisi yang ditolak:

```txt
open -> resolved
assigned -> resolved
closed -> in_progress
```

Jika transisi tidak valid, sistem mengembalikan error validasi `422`.

## Auto Assignment

Auto assignment memilih agent aktif berdasarkan:

1. jumlah tiket aktif paling sedikit;
2. `last_assigned_at` paling lama;
3. `id` agent paling kecil sebagai tie-breaker terakhir.

Tiket aktif yang dihitung:

- `assigned`
- `in_progress`

Proses assignment menggunakan database transaction dan row lock agar lebih aman ketika beberapa tiket dibuat bersamaan.

Jika tidak ada agent aktif, tiket tetap berada di status `open` tanpa agent.

## Audit Trail

Setiap perubahan status masuk ke `ticket_status_histories`.

Data yang dicatat:

- status asal;
- status tujuan;
- user yang mengubah;
- note opsional;
- waktu perubahan.

Auto assignment oleh sistem juga dicatat dengan `changed_by_id = null`.

## Notifikasi Email

Email yang dikirim sistem:

| Trigger                        | Penerima           |
| ------------------------------ | ------------------ |
| Tiket baru assigned            | Agent              |
| User membalas tiket            | Agent assigned     |
| Agent/admin membalas tiket     | User pembuat tiket |
| Tiket berubah menjadi resolved | User pembuat tiket |

Email assignment bersifat idempotent memakai `assigned_notification_sent_at`, sehingga retry job tidak mengirim email assignment berulang untuk tiket yang sama.

## Endpoint Web

| Method  | Endpoint                    | Fungsi               |
| ------- | --------------------------- | -------------------- |
| `GET`   | `/tickets`                  | Daftar tiket         |
| `GET`   | `/tickets/create`           | Form buat tiket      |
| `POST`  | `/tickets`                  | Simpan tiket dari UI |
| `GET`   | `/tickets/{ticket}`         | Detail tiket         |
| `PATCH` | `/tickets/{ticket}/status`  | Update status tiket  |
| `POST`  | `/tickets/{ticket}/replies` | Kirim balasan tiket  |

## Endpoint API

### Membuat Tiket

```txt
POST /api/tickets
```

Payload:

```json
{
    "title": "Printer error",
    "description": "Printer kasir tidak bisa mencetak struk.",
    "priority": "high"
}
```

Response sukses: `201 Created`

Contoh response:

```json
{
    "data": {
        "id": 1,
        "title": "Printer error",
        "description": "Printer kasir tidak bisa mencetak struk.",
        "priority": {
            "value": "high",
            "label": "High"
        },
        "status": {
            "value": "assigned",
            "label": "Assigned"
        }
    }
}
```

Jika validasi gagal, response `422` berisi error JSON.

### Melihat History Tiket

```txt
GET /api/tickets/{ticket}/history
```

Endpoint ini mengembalikan daftar riwayat perubahan status tiket, terbaru lebih dulu.

## Testing

Jalankan test utama:

```bash
php artisan test --compact
```

Jalankan test ticket support saja:

```bash
php artisan test --compact tests/Feature/TicketSupportTest.php
```

Format PHP:

```bash
vendor/bin/pint --dirty --format agent
```

Type check frontend:

```bash
npm run types:check
```

Build frontend:

```bash
npm run build
```

## Troubleshooting

### Email Tidak Masuk

Cek queue worker:

```bash
php artisan queue:work
```

Cek job pending di database table `jobs`.

Cek failed jobs:

```bash
php artisan queue:failed
```

Cek log:

```bash
tail -n 100 storage/logs/laravel.log
```

### Perubahan `.env` Tidak Terbaca

Jalankan:

```bash
php artisan config:clear
```

### Frontend Tidak Berubah

Pastikan Vite berjalan:

```bash
npm run dev
```

Atau build ulang:

```bash
npm run build
```

### Tidak Bisa Membuat Tiket

Pastikan login sebagai user dengan role `user`. Agent tidak diizinkan membuat tiket.

### Tidak Bisa Update Status

Pastikan status mengikuti state machine. Contoh, dari `assigned` harus ke `in_progress` lebih dulu, tidak bisa langsung ke `resolved`.

## Catatan Keamanan

- Jangan commit `.env`.
- Jangan commit Gmail App Password atau SMTP credential.
- Gunakan email dummy di `.env.example`.
- Gunakan `.env` lokal untuk email asli saat development.

## Batasan Versi Saat Ini

- Belum ada SLA dan auto escalation.
- Belum ada multi-channel seperti live chat atau telepon.
- Belum ada analytics/reporting mendalam.
- Belum ada reopen dari `resolved` ke `in_progress`.
- Belum ada auto re-assignment berkala untuk tiket yang belum assigned saat semua agent nonaktif.
