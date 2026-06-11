// ════════════════════════════════════════════════════════════
//  HMSI PILAR AKSI — Data Layer
//  Ganti MOCK_MEMBERS & MOCK_DEPTS dengan data real dari API
// ════════════════════════════════════════════════════════════

const AVATARCOLORS = [
    '#1E56A0', '#2E6BC4', '#22C55E', '#8B5CF6',
    '#E85D24', '#D4A017', '#0891B2', '#DB2777'
];

// ── MEMBERS ──────────────────────────────────────────────────
// Kolom: id, name, nrp, dept, pos, batch, score, band
// score & band diisi setelah assessment — null = belum diisi
//
// Dept codes:
//   EB      → Executive Board          (BPH)
//   HRD     → Human Resource Dev       (PSDM)
//   IA      → Internal Affairs         (DAGRI)
//   SWF     → Student Welfare          (KESMA)
//   RTA     → Research & Technology    (PTA)
//   IM      → Information Media        (MEDINFO)
//   EA      → External Affairs         (DAGLU)
//   ES      → Entrepreneurship         (KEWIR)
//   SOCDEV  → Social Development       (PENGSOS)
//   MANAGE  → Cadre Management         (KADER)

const MOCK_MEMBERS = [
    // ── EB / Executive Board ──
    { id: 1, name: 'Abrorus Shobah', nrp: '5026231145', dept: 'EB', pos: 'Ketua', batch: '2023', score: null, band: null },
    { id: 2, name: 'Nabila Rahadatul Aisy K.', nrp: '5026231025', dept: 'EB', pos: 'Wakil Ketua Internal', batch: '2023', score: null, band: null },
    { id: 3, name: 'Muhammad Ridho Utomo', nrp: '5026231143', dept: 'EB', pos: 'Wakil Ketua External', batch: '2023', score: null, band: null },
    { id: 4, name: 'Binar Faisha Wijdan', nrp: '5026231080', dept: 'EB', pos: 'Sekretaris Umum 1', batch: '2023', score: null, band: null },
    { id: 5, name: 'Michelle Limantara', nrp: '5026241096', dept: 'EB', pos: 'Sekretaris Umum 2', batch: '2024', score: null, band: null },
    { id: 6, name: 'Shaakira Nashwa Jessamine', nrp: '5051231029', dept: 'EB', pos: 'Bendahara Umum 1', batch: '2023', score: null, band: null },
    { id: 7, name: 'Raffly Faizal Altariq', nrp: '5026241158', dept: 'EB', pos: 'Bendahara Umum 2', batch: '2024', score: null, band: null },

    // ── HRD / Human Resource Development ──
    { id: 8, name: 'Nadia Ayula Assyaputri', nrp: '5026231090', dept: 'HRD', pos: 'Kepala Departemen', batch: '2023', score: null, band: null },
    { id: 9, name: 'Kayla Putri Maharani', nrp: '5026231158', dept: 'HRD', pos: 'Wakil Kepala Departemen', batch: '2023', score: null, band: null },
    { id: 10, name: 'Azrul Afif Syafaturahman', nrp: '5026231166', dept: 'HRD', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 11, name: 'Gerald Marcell Van Rayne', nrp: '5026231073', dept: 'HRD', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 12, name: 'Naura Salsabila', nrp: '5026231173', dept: 'HRD', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 13, name: 'Dimas Fanza Saputra', nrp: '5051241017', dept: 'HRD', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 14, name: 'Afisya Nasywa Tsabitah', nrp: '5026241035', dept: 'HRD', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 15, name: "Choirunnisa' Irianti", nrp: '5026241010', dept: 'HRD', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 16, name: 'Adiiba Putri Hanifah', nrp: '5026241009', dept: 'HRD', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 17, name: 'Dyandra R-Noor Batari', nrp: '5026241051', dept: 'HRD', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 18, name: 'Muhammad Rezka Apasha', nrp: '5026241197', dept: 'HRD', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 19, name: 'Fachriza Rizky S', nrp: '5026241092', dept: 'HRD', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 20, name: 'Maria Elvina Putri Damayanti', nrp: '5026241012', dept: 'HRD', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 21, name: 'Firnas Fadaukas Ahmad', nrp: '5026241061', dept: 'HRD', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },

    // ── IA / Internal Affairs ──
    { id: 22, name: 'Jeremy Anggi', nrp: '5026231155', dept: 'IA', pos: 'Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 23, name: 'Alisha Rafimalia', nrp: '5026231202', dept: 'IA', pos: 'Wakil Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 24, name: 'Rafael Dimas Khristianto', nrp: '5026231206', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 25, name: 'Muhammad Hammam Aditama', nrp: '5026231179', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 26, name: 'Ayesha Hana Azkiya', nrp: '5026231125', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 27, name: 'Vythra Rizky Maulana', nrp: '5051231032', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 28, name: 'Muhammad Ikhwanul Hafidz', nrp: '5026231192', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 29, name: 'Realasa Femmi Novelika', nrp: '5026231113', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 30, name: 'Muhammad Faiz Roihan', nrp: '5026231098', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 31, name: 'Tahiyyah Mufhimah', nrp: '5026231170', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 32, name: 'Fachry Ananda Akmal', nrp: '5026241025', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 33, name: 'Muhammad Rifqi Ahnaf Novanto', nrp: '5026241118', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 34, name: 'Muhammad Hanif Syahnandra', nrp: '5026241176', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 35, name: 'Raditya Prazenko Reswara', nrp: '5026241155', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 36, name: 'Dziky Fajryan Noersyafitrah', nrp: '5026241151', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 37, name: 'Nayla Rameyza Alya', nrp: '5026241059', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 38, name: 'Pande Made Yonata Axel Eldrian', nrp: '5026241018', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 39, name: 'Khalisa Aulia Zahra', nrp: '5026241077', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 40, name: 'Yesica Ingrita Manik', nrp: '5026241072', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 41, name: 'Muhammad Ramdhan Zulfikri', nrp: '5026241106', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 42, name: 'Lenno Andhika Pramudya A.', nrp: '5026241057', dept: 'IA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 43, name: 'Avissa Riyandita Putri', nrp: '5026241190', dept: 'IA', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },

    // ── SWF / Student Welfare ──
    { id: 44, name: 'Raffi Deva Anargya', nrp: '5026231104', dept: 'SWF', pos: 'Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 45, name: 'Yudhistira Armico Fidly', nrp: '5026231067', dept: 'SWF', pos: 'Wakil Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 46, name: 'Muhammad Abyan Tsabit Amani', nrp: '5026231163', dept: 'SWF', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 47, name: 'Daniel Setiawan Yulius Putra', nrp: '5026231010', dept: 'SWF', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 48, name: 'Erika Cahya Ningtyas', nrp: '5051231037', dept: 'SWF', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 49, name: 'Gelar Ridho Ramadhan', nrp: '5026241045', dept: 'SWF', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 50, name: 'Muhammad Mursito Aji', nrp: '5026241142', dept: 'SWF', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 51, name: 'Nashiwa Insan Muflih', nrp: '5026241143', dept: 'SWF', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },
    { id: 52, name: 'Elfa Setiana', nrp: '5026241208', dept: 'SWF', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 53, name: 'Aludra Nadia Salwa', nrp: '5026241098', dept: 'SWF', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 54, name: 'Salsa Aulia Azzahra Havenanda', nrp: '5026241019', dept: 'SWF', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 55, name: 'Nafisa Putri Az Zahroh', nrp: '5026241184', dept: 'SWF', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 56, name: 'Muhammad Akbar Ilman Setijadi', nrp: '5026241111', dept: 'SWF', pos: 'Staff Departemen', batch: '2024', score: null, band: null },

    // ── RTA / Research and Technology Application ──
    { id: 57, name: 'Firmansyah Adi Prasetyo', nrp: '5026231085', dept: 'RTA', pos: 'Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 58, name: 'Hafidz Putra Dermawan', nrp: '5026231211', dept: 'RTA', pos: 'Wakil Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 59, name: 'Akhtar Zia Faizarrobbi', nrp: '5026231095', dept: 'RTA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 60, name: 'Yusuf Acala Sadurjaya Sri Krisna', nrp: '5026231089', dept: 'RTA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 61, name: 'Bimo Rajendra Widyadhana', nrp: '5026231210', dept: 'RTA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 62, name: 'Burju Ferdinand Harianja', nrp: '5026231066', dept: 'RTA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 63, name: 'Ahmad Maulana Al Farel Rizantha', nrp: '5026241114', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 64, name: 'Yustisio Priyatno', nrp: '5026241104', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 65, name: 'Kania Putri Baihakim', nrp: '5051241032', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 66, name: 'Fahmi Gema Fadilla', nrp: '5026241200', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 67, name: 'Andien Yulia Lestari', nrp: '5051241019', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 68, name: 'Eka Destriana Putri', nrp: '5026241164', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 69, name: 'Ary Ratna Aida Safa', nrp: '5026241029', dept: 'RTA', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },
    { id: 70, name: 'Milawati', nrp: '5026241163', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 71, name: 'Laurentius Lafrellio Soewandi', nrp: '5026241102', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 72, name: 'Maria Stephanie Febryana Kristijanto', nrp: '5026241052', dept: 'RTA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },

    // ── IM / Information Media ──
    { id: 73, name: 'Naufal Erwin', nrp: '5026231152', dept: 'IM', pos: 'Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 74, name: 'Farrel Aditya Rosyidi', nrp: '5026231177', dept: 'IM', pos: 'Wakil Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 75, name: 'Hafizhan Yusra Sulistyo', nrp: '5026231060', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 76, name: 'Ida Bagus Adhiraga Yudhistira', nrp: '5026231120', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 77, name: 'Mirza Fathi Taufiqurrahman', nrp: '5026231105', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 78, name: 'Kayla Nathania Azzahra', nrp: '5026231151', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 79, name: 'Adityo Rafi Wardhana', nrp: '5026231209', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 80, name: 'Michelle Lea Amanda', nrp: '5026231214', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 81, name: 'Mukhammad Bagas Aditya', nrp: '5026241011', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2024', score: null, band: null },
    { id: 82, name: 'Tiara Aulia Azadirachta Indica', nrp: '5026231148', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 83, name: 'Beh Siu Li', nrp: '5026231065', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 84, name: 'Shifly Taysir Setiawan', nrp: '5026231046', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 85, name: 'Achlano Affan Rasyad', nrp: '5051241031', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 86, name: 'Muhammad Ghazy', nrp: '5026241134', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 87, name: 'Gusti Ayu Wedha Putri Surya', nrp: '5026241083', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 88, name: 'Muhammad Rizqy Aulia', nrp: '5026241084', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 89, name: 'Dinny Maria Pical', nrp: '5051241026', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 90, name: 'Ailsa Des Daneela', nrp: '5026241116', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 91, name: 'Sylvia Nadia Maharani', nrp: '5026241160', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 92, name: 'Tavasya Alia Anjani', nrp: '5026241067', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 93, name: 'Fabio Andrea Liui', nrp: '5026241146', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 94, name: 'Syahdu Szenovera Maharani', nrp: '5026241038', dept: 'IM', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },
    { id: 95, name: 'Haura Rahiva Syahla', nrp: '5026241056', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 96, name: 'Muhammad Fasha Asshofa', nrp: '5026241095', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 97, name: 'Mario Bimawan Setyo', nrp: '5051241007', dept: 'IM', pos: 'Staff Departemen', batch: '2024', score: null, band: null },

    // ── EA / External Affairs ──
    { id: 98, name: 'Auliya Malika Idi', nrp: '5026231141', dept: 'EA', pos: 'Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 99, name: 'Muhammad Daniel Alfarisi', nrp: '5026231161', dept: 'EA', pos: 'Wakil Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 100, name: 'Burhan Shidqi Arrasyid', nrp: '5026231074', dept: 'EA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 101, name: 'Khalila Shafarayhani Atletiko', nrp: '5026231167', dept: 'EA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 102, name: 'Fadhiil Akmal Hamizan', nrp: '5026231128', dept: 'EA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 103, name: 'Irhab Faiz Hidayat', nrp: '5051231041', dept: 'EA', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 104, name: 'Rofifah Zain Nur Alfiyah', nrp: '5026241131', dept: 'EA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 105, name: 'Muhammad Izzan Aquilla', nrp: '5026241069', dept: 'EA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 106, name: 'Aliya Nur Kamila Silia', nrp: '5026241008', dept: 'EA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 107, name: 'Mahda Veika', nrp: '5026241050', dept: 'EA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 108, name: 'Naina Mazaya Putri', nrp: '5026241183', dept: 'EA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 109, name: 'Mega Agustina Sihombing', nrp: '5026241165', dept: 'EA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 110, name: 'Mazaya Zharfani Erfindri', nrp: '5026241138', dept: 'EA', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 111, name: 'Alwida Rahmat', nrp: '5026241090', dept: 'EA', pos: 'Bendahara Departemen', batch: '2024', score: null, band: null },
    { id: 112, name: 'Athilah Syahshiyah Tsabita', nrp: '5026241031', dept: 'EA', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },

    // ── ES / Entrepreneurship ──
    { id: 113, name: 'Muhammad Afiq Ridha Pratama', nrp: '5051231030', dept: 'ES', pos: 'Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 114, name: 'Diffa Adzra Anelya', nrp: '5051231021', dept: 'ES', pos: 'Wakil Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 115, name: 'Faradita Syaharani Murdiyana', nrp: '5051231009', dept: 'ES', pos: 'Bendahara Departemen', batch: '2023', score: null, band: null },
    { id: 116, name: 'Widda Farrah Kayla', nrp: '5026241119', dept: 'ES', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },
    { id: 117, name: 'Naufal Zahran Ahnafi Yusup', nrp: '5051231016', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 118, name: 'Syamil Rizqy Rayvianda Agil', nrp: '5051231031', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 119, name: 'Adhharul Haqqullah', nrp: '5051231007', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 120, name: 'Mohammad Wahyu Dwi N.', nrp: '5051231025', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 121, name: 'Ahmed Miftah Ghiffari', nrp: '5026231102', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 122, name: 'Sahilah Amru Yumnatusta', nrp: '5026231182', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 123, name: 'Faiz Willy Abiyyu', nrp: '5026241166', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 124, name: 'Fauzan Azura', nrp: '5026241161', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 125, name: 'Athallah Hilman Hilalazka', nrp: '5026241145', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 126, name: 'Fawzy Muhammad Dzaake', nrp: '5026241064', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 127, name: 'Muhammad Hanifiansyah', nrp: '5026241136', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 128, name: 'Maria Arum Ningtyas', nrp: '5026241026', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 129, name: 'Yudith Zharifah Utami', nrp: '5026241015', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 130, name: 'Aurelyo Nouvabryano Akhmad', nrp: '5026241175', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 131, name: 'Rivansyah Fathur Rozaq', nrp: '5026241088', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 132, name: 'Ida Bagus Putu Dharma Yudhana', nrp: '5026241195', dept: 'ES', pos: 'Staff Departemen', batch: '2024', score: null, band: null },

    // ── SOCDEV / Social Development ──
    { id: 133, name: 'Zaskia Muazatun M', nrp: '5026231021', dept: 'SOCDEV', pos: 'Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 134, name: 'Ayu Alfia Putri', nrp: '5026231033', dept: 'SOCDEV', pos: 'Wakil Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 135, name: 'Imtiyaz Shafhal Afif', nrp: '5026231197', dept: 'SOCDEV', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 136, name: 'Lita Sari Banjarnahor', nrp: '5026231029', dept: 'SOCDEV', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 137, name: 'Bagas Rafi Dewantara', nrp: '5026231091', dept: 'SOCDEV', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 138, name: 'Nadya Luthfiyah Rahma', nrp: '5026231023', dept: 'SOCDEV', pos: 'Staff Ahli Departemen', batch: '2023', score: null, band: null },
    { id: 139, name: 'Ahmad Farhad Mabrury', nrp: '5026241034', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 140, name: 'Akhmad Syauqi Rifan Fathoni', nrp: '5026241021', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 141, name: 'Muhammad Erfan Zidni', nrp: '5026241177', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 142, name: 'Aisyah Nabilah Putri', nrp: '5026241141', dept: 'SOCDEV', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },
    { id: 143, name: 'Athaya Hafidz Furqon A.', nrp: '5026241173', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 144, name: 'Zalfa Fathiyah Adila', nrp: '5051241029', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 145, name: 'Dimas Ananda Destariansyah', nrp: '5026241113', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 146, name: 'Muhammad Akhtar Maulana B.', nrp: '5026241139', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 147, name: 'Jennifer Nabiila Nanda Hariani', nrp: '5026241022', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 148, name: 'Izzana Firdaunnisa', nrp: '5026241203', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 149, name: 'M. Khadavi Khalid', nrp: '5026241181', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 150, name: 'Riu Shandy Lintar Pratama', nrp: '5026241046', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024', score: null, band: null },

    // ── MANAGE / Cadre Management ──
    { id: 151, name: 'Maulana Muhammad Ad-Dzikri', nrp: '5026231136', dept: 'MANAGE', pos: 'Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 152, name: 'Jasmine Fathina Hakim', nrp: '5026231017', dept: 'MANAGE', pos: 'Wakil Ketua Departemen', batch: '2023', score: null, band: null },
    { id: 153, name: 'Rafi Bartie Putra Nayar', nrp: '5026241178', dept: 'MANAGE', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 154, name: 'Ruminureast Channing', nrp: '5026241125', dept: 'MANAGE', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
    { id: 155, name: 'Husna Sabela', nrp: '5026241205', dept: 'MANAGE', pos: 'Sekretaris Departemen', batch: '2024', score: null, band: null },
    { id: 156, name: 'Naufatuzaki Auliazahra Marjuki', nrp: '5026241032', dept: 'MANAGE', pos: 'Staff Departemen', batch: '2024', score: null, band: null },
];

// ── DEPARTMENTS ───────────────────────────────────────────────
const MOCK_DEPTS = [
    { id: 1, name: 'EB', fullname: 'Executive Board', members: 7, avg: null, color: '#D4A017' },
    { id: 2, name: 'HRD', fullname: 'Human Resource Development', members: 14, avg: null, color: '#1E56A0' },
    { id: 3, name: 'IA', fullname: 'Internal Affairs', members: 22, avg: null, color: '#22C55E' },
    { id: 4, name: 'SWF', fullname: 'Student Welfare', members: 13, avg: null, color: '#0891B2' },
    { id: 5, name: 'RTA', fullname: 'Research and Technology', members: 16, avg: null, color: '#8B5CF6' },
    { id: 6, name: 'IM', fullname: 'Information Media', members: 25, avg: null, color: '#DB2777' },
    { id: 7, name: 'EA', fullname: 'External Affairs', members: 15, avg: null, color: '#E85D24' },
    { id: 8, name: 'ES', fullname: 'Entrepreneurship', members: 20, avg: null, color: '#059669' },
    { id: 9, name: 'SOCDEV', fullname: 'Social Development', members: 18, avg: null, color: '#6366F1' },
    { id: 10, name: 'MANAGE', fullname: 'Cadre Management', members: 6, avg: null, color: '#DC2626' },
];

// ── API Skeleton ─────────────────────────────────────────────
// Ganti dengan fetch nyata kalau sudah ada backend
const API = {
    async getMembers() { return MOCK_MEMBERS; },
    async getDepartments() { return MOCK_DEPTS; },
    async getTopPerformers() {
        const withScore = MOCK_MEMBERS.filter(m => m.score !== null);
        return withScore.sort((a, b) => b.score - a.score).slice(0, 10);
    }
};