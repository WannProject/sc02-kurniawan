# PRD: Sistem Antrian Tiket Support

**Fokus: Queue & State Management**

---

## 1. Overview

Sistem antrian tiket support yang menangani pembuatan tiket, distribusi otomatis ke agent, alur status yang terkontrol (state machine), notifikasi asynchronous via queue, dan audit trail penuh atas setiap perubahan status.

**Tech stack:** Laravel 13 (starter kit resmi React + Inertia), MySQL 8, queue driver database (default, tanpa infra tambahan seperti Redis).

## 2. Latar Belakang & Masalah

Tanpa sistem terpusat, distribusi tiket ke agent dilakukan manual (tidak merata), status tiket bisa berubah sembarangan tanpa validasi alur (misal langsung "resolved" tanpa pernah dikerjakan), dan tidak ada jejak siapa mengubah apa. Notifikasi yang dikirim synchronous juga memperlambat response time saat traffic tinggi.

## 3. Tujuan (Goals)

- Distribusi tiket otomatis & adil ke agent berdasarkan beban kerja aktif.
- Alur status yang divalidasi ketat — tidak bisa "loncat" status sembarangan.
- Notifikasi ke agent tanpa membebani response time endpoint pembuatan tiket (async via queue).
- Traceability penuh: setiap perubahan status tercatat (siapa, kapan, dari status apa ke status apa).

## 4. Non-Goals (Out of Scope v1)

- SLA / auto-escalation berdasarkan waktu.
- Multi-channel (live chat, telepon) — fokus tiket saja.
- Dashboard reporting/analytics.
- Role & permission granular (asumsikan dua peran sederhana: agent & admin).

## 5. Stakeholder

| Peran          | Kebutuhan                                                   |
| -------------- | ----------------------------------------------------------- |
| User (pelapor) | Membuat tiket, memantau status                              |
| Agent          | Menerima assignment, mengubah status, dapat notifikasi      |
| Admin          | Monitor keseluruhan, lihat audit trail, override bila perlu |

## 6. User Stories

- Sebagai **user**, saya ingin membuat tiket (judul, deskripsi, prioritas) agar masalah saya tercatat.
- Sebagai **sistem**, tiket baru harus otomatis ter-assign ke agent dengan beban tiket aktif paling sedikit, agar distribusi kerja merata.
- Sebagai **agent**, saya ingin menerima notifikasi email saat ada tiket baru di-assign, tanpa membuat proses pembuatan tiket jadi lambat.
- Sebagai **agent/admin**, saya ingin mengubah status tiket hanya melalui alur yang valid.
- Sebagai **admin**, saya ingin melihat histori lengkap perubahan status tiap tiket untuk keperluan audit.

## 7. Functional Requirements

### FR-1 — Pembuatan Tiket

- `POST /api/tickets`
- Field: `title` (required, max 255), `description` (required), `priority` (enum: `low|medium|high`, required)
- Status awal: **open**
- `created_by` = user yang membuat (dari auth)

### FR-2 — Status Lifecycle & Aturan Transisi

State: `open → assigned → in_progress → resolved → closed`

**Tabel transisi yang diizinkan:**

| Dari        | Ke                       | Trigger                               |
| ----------- | ------------------------ | ------------------------------------- |
| open        | assigned                 | sistem (auto-assignment)              |
| assigned    | in_progress              | agent mulai mengerjakan               |
| in_progress | resolved                 | agent menandai selesai                |
| resolved    | closed                   | admin/user konfirmasi tutup           |
| resolved    | in_progress _(opsional)_ | reopen jika belum benar-benar selesai |

**Transisi yang DILARANG (contoh):**

- `open → resolved`, `open → in_progress`, `open → closed` (harus lewat assigned dulu)
- `assigned → resolved` (harus lewat in_progress)
- `closed → *` (closed bersifat terminal, kecuali ada alur reopen eksplisit yang didefinisikan terpisah)

Setiap request perubahan status **wajib** divalidasi terhadap tabel ini di layer service (bukan langsung update kolom). Transisi tidak valid → HTTP 422 dengan pesan jelas.

### FR-3 — Auto Assignment

- Trigger: langsung setelah tiket dibuat (open → assigned dalam satu alur).
- Algoritma: pilih agent **aktif** dengan jumlah tiket aktif (status `assigned` atau `in_progress`) **paling sedikit**.
- Tie-breaker: agent yang paling lama tidak menerima assignment (`last_assigned_at` paling lama), atau round-robin berdasarkan urutan id.
- **Wajib race-condition safe**: dua tiket yang dibuat bersamaan tidak boleh salah hitung beban dan jatuh ke agent yang sama secara tidak adil. Perhitungan + penetapan assignment harus atomic (row lock / transaction).
- Kasus tepi: bila tidak ada agent aktif tersedia, tiket masuk status `open` tanpa assignment (unassigned queue) — lihat Risiko §11.

### FR-4 — Notifikasi Email via Queue

- Setelah assignment terjadi, dispatch job pengiriman email ke agent.
- **Wajib asynchronous** (queue job) — tidak boleh mengirim email secara synchronous dalam siklus request pembuatan tiket.
- Job harus punya retry policy (misal 3x, backoff eksponensial) dan penanganan kegagalan (tercatat, tidak hilang begitu saja).
- Idempoten: retry job tidak boleh mengirim email duplikat ke agent yang sama untuk assignment yang sama.

### FR-5 — Audit Trail

- `GET /api/tickets/{id}/history`
- Mengembalikan daftar perubahan status: `from_status`, `to_status`, `changed_by` (user/agent/system), `note` (opsional), `created_at`, terurut terbaru dulu.
- **Setiap** transisi status — termasuk auto-assignment oleh sistem — wajib tercatat, tanpa terkecuali.

## 8. Data Model (garis besar)

**tickets**
`id, title, description, priority, status, assigned_agent_id (nullable), created_by, created_at, updated_at`

**ticket_status_histories**
`id, ticket_id, from_status (nullable — untuk entri pertama), to_status, changed_by (nullable jika by system), note, created_at`

**agents**
`id, user_id/name, is_active, last_assigned_at (untuk tie-break)`

## 9. Non-Functional Requirements

- **Reliability**: job gagal wajib retry otomatis; kegagalan permanen tercatat (mis. `failed_jobs`) agar bisa di-requeue manual.
- **Consistency**: perubahan status + entri audit trail harus atomic dalam satu DB transaction — tidak boleh ada status berubah tanpa jejak audit, atau sebaliknya.
- **Concurrency safety**: logic assignment tahan terhadap race condition saat banyak tiket dibuat bersamaan.
- **Observability**: logging minimal untuk setiap transisi status dan setiap kegagalan job notifikasi.

## 10. Success Metrics

- 0% tiket dengan transisi status ilegal di production.
- 100% notifikasi terkirim (termasuk via retry) atau tercatat sebagai failed & dapat di-requeue — tidak ada yang hilang diam-diam.
- Variance jumlah tiket aktif antar agent rendah (tidak ada agent overload sementara yang lain menganggur).

## 11. Risks & Open Questions

- Bagaimana bila semua agent nonaktif/tidak tersedia saat tiket dibuat? Perlu fallback unassigned queue + mekanisme re-assign berkala?
- Apakah alur reopen (`resolved`/`closed → in_progress`) dibutuhkan di v1, atau ditunda?
- Siapa yang berwenang melakukan override assignment manual (admin saja, atau agent lain juga)?
- Bagaimana kebijakan retry job notifikasi yang gagal permanen — auto-requeue, atau butuh intervensi manual?

## 12. Out of Scope (v1)

Sama seperti §4 — SLA/escalation, multi-channel, dashboard analytics, RBAC granular.
