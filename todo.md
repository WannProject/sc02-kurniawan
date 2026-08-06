relo# Todo

Dokumen ini mencatat urutan kerja yang perlu dieksekusi pada sistem antrian tiket ini. Urutannya disusun dari dampak tertinggi ke risiko teknis tertinggi.

## 1. Kunci test untuk alur inti

- [x] Tambahkan test untuk `TicketController` pada alur `index`, `create`, `store`, dan `show`.
- [x] Tambahkan test untuk `TeamController` pada alur `index`, `store`, `edit`, `update`, `switch`, `leave`, dan `destroy`.
- [x] Tambahkan test untuk `TicketStatusService` pada pembuatan tiket, transisi status, dan status yang terkunci.
- [x] Tambahkan test untuk history status tiket agar setiap perubahan status tercatat dengan benar.
- [x] Jalankan test yang terdampak sampai semuanya hijau.

## 2. Amankan aturan transisi status tiket

- [x] Verifikasi semua status awal, status tujuan, dan status terlarang pada `TicketStatusService`.
- [x] Pastikan transisi yang tidak valid ditolak dengan error yang jelas.
- [x] Pastikan state tiket tidak bisa berubah tanpa pencatatan history.
- [x] Pastikan aturan lock/unlock status bekerja konsisten di semua jalur masuk.

## 3. Audit authorization dan membership tim

- [x] Tinjau `TeamPolicy` untuk aksi create, update, delete, dan akses anggota.
- [x] Tinjau `HasTeams` untuk memastikan pengecekan membership dan permission tidak dobel atau bertentangan.
- [x] Tinjau `EnsureTeamMembership` untuk memastikan akses lintas tim benar-benar dibatasi.
- [x] Tinjau request class yang sensitif, terutama delete dan update tim, agar validasi authorization ada di tempat yang tepat.
- [x] Tambahkan test untuk skenario akses yang ditolak.

## 4. Authorization ticket

- [x] Tambahkan `TicketPolicy` untuk membatasi update status ticket.
- [x] Batasi `UpdateTicketStatusRequest` agar hanya agent yang di-assign ke ticket bisa mengubah status.
- [x] Tambahkan test untuk user biasa yang ditolak saat update status ticket.

## 5. Rapikan pengalaman operasional di frontend

- [x] Ubah `welcome`, `login`, `register`, dan `dashboard` ke layout shadcn.
- [x] Pakai `Card`, `Badge`, `Button`, dan `Separator` pada entry point utama.
- [ ] Pastikan halaman pembuatan tiket memandu user dengan jelas dan minim langkah.
- [x] Tambahkan atau perkuat ringkasan status tiket pada halaman detail tiket.
- [ ] Tambahkan kontrol yang memudahkan perpindahan status atau tindakan cepat pada tiket aktif.
- [x] Tinjau `TeamSwitcher` agar pergantian tim tidak membingungkan dan selalu menampilkan konteks aktif.
- [x] Tinjau komponen layout agar navigasi utama tetap jelas di desktop dan mobile.

## 6. Tambahkan observability dasar

- [x] Tambahkan logging yang konsisten pada create, assign, dan transition ticket.
- [ ] Catat alasan penolakan pada transisi atau authorization yang gagal.
- [x] Pastikan error backend yang penting mudah dilacak dari log.
- [ ] Tinjau kebutuhan notifikasi untuk aksi tiket yang kritis.

## 7. Validasi akhir

- [x] Jalankan test suite yang relevan setelah setiap perubahan besar.
- [x] Cek ulang alur utama dari sisi user: buat tiket, lihat detail tiket, ubah status, pindah tim.
- [x] Pastikan tidak ada regresi di UI maupun authorization.
- [ ] Dokumentasikan keputusan teknis yang baru jika ada aturan bisnis yang berubah.

## 8. Setup environment lokal

- [x] Pindahkan konfigurasi default ke MySQL di `.env.example`.
- [x] Tambahkan `compose.yml` untuk menjalankan service MySQL lokal.
- [x] Validasi konfigurasi compose dengan `docker compose config`.

## 9. Role aplikasi PRD

- [x] Tambahkan role aplikasi dasar `user`, `agent`, dan `admin` pada model user.
- [x] Pastikan user baru terdaftar sebagai `user` secara default.
- [x] Tambahkan pembatasan akses berbasis role di area ticket create, ticket index, ticket show, dan status update.
- [x] Buka akses status update untuk admin sebagai override.
- [ ] Tambahkan pembatasan akses berbasis role di area admin settings yang tersisa.

## Urutan Eksekusi yang Disarankan

1. Test alur inti.
2. Aturan transisi status tiket.
3. Authorization dan membership tim.
4. UX operasional frontend.
5. Observability dan logging.
6. Validasi akhir end-to-end.
