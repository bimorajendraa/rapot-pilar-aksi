const mysql = require('mysql2/promise');
require('dotenv').config();

const MOCK_DEPTS = [
    { name: 'EB', fullname: 'Executive Board', color: '#D4A017' },
    { name: 'HRD', fullname: 'Human Resource Development', color: '#1E56A0' },
    { name: 'IA', fullname: 'Internal Affairs', color: '#22C55E' },
    { name: 'SWF', fullname: 'Student Welfare', color: '#0891B2' },
    { name: 'RTA', fullname: 'Research and Technology', color: '#8B5CF6' },
    { name: 'IM', fullname: 'Information Media', color: '#DB2777' },
    { name: 'EA', fullname: 'External Affairs', color: '#E85D24' },
    { name: 'ES', fullname: 'Entrepreneurship', color: '#059669' },
    { name: 'SOCDEV', fullname: 'Social Development', color: '#6366F1' },
    { name: 'MANAGE', fullname: 'Cadre Management', color: '#DC2626' },
];

const MOCK_MEMBERS = [
    { name: 'Abrorus Shobah', nrp: '5026231145', dept: 'EB', pos: 'Ketua', batch: '2023' },
    { name: 'Nabila Rahadatul Aisy K.', nrp: '5026231025', dept: 'EB', pos: 'Wakil Ketua Internal', batch: '2023' },
    { name: 'Muhammad Ridho Utomo', nrp: '5026231143', dept: 'EB', pos: 'Wakil Ketua External', batch: '2023' },
    { name: 'Binar Faisha Wijdan', nrp: '5026231080', dept: 'EB', pos: 'Sekretaris Umum 1', batch: '2023' },
    { name: 'Michelle Limantara', nrp: '5026241096', dept: 'EB', pos: 'Sekretaris Umum 2', batch: '2024' },
    { name: 'Shaakira Nashwa Jessamine', nrp: '5051231029', dept: 'EB', pos: 'Bendahara Umum 1', batch: '2023' },
    { name: 'Raffly Faizal Altariq', nrp: '5026241158', dept: 'EB', pos: 'Bendahara Umum 2', batch: '2024' },
    { name: 'Nadia Ayula Assyaputri', nrp: '5026231090', dept: 'HRD', pos: 'Kepala Departemen', batch: '2023' },
    { name: 'Kayla Putri Maharani', nrp: '5026231158', dept: 'HRD', pos: 'Wakil Kepala Departemen', batch: '2023' },
    { name: 'Azrul Afif Syafaturahman', nrp: '5026231166', dept: 'HRD', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Gerald Marcell Van Rayne', nrp: '5026231073', dept: 'HRD', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Naura Salsabila', nrp: '5026231173', dept: 'HRD', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Dimas Fanza Saputra', nrp: '5051241017', dept: 'HRD', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Afisya Nasywa Tsabitah', nrp: '5026241035', dept: 'HRD', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Choirunnisa\' Irianti', nrp: '5026241010', dept: 'HRD', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Adiiba Putri Hanifah', nrp: '5026241009', dept: 'HRD', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Dyandra R-Noor Batari', nrp: '5026241051', dept: 'HRD', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Rezka Apasha', nrp: '5026241197', dept: 'HRD', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Fachriza Rizky S', nrp: '5026241092', dept: 'HRD', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Maria Elvina Putri Damayanti', nrp: '5026241012', dept: 'HRD', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Firnas Fadaukas Ahmad', nrp: '5026241061', dept: 'HRD', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Jeremy Anggi', nrp: '5026231155', dept: 'IA', pos: 'Ketua Departemen', batch: '2023' },
    { name: 'Alisha Rafimalia', nrp: '5026231202', dept: 'IA', pos: 'Wakil Ketua Departemen', batch: '2023' },
    { name: 'Rafael Dimas Khristianto', nrp: '5026231206', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Muhammad Hammam Aditama', nrp: '5026231179', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Ayesha Hana Azkiya', nrp: '5026231125', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Vythra Rizky Maulana', nrp: '5051231032', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Muhammad Ikhwanul Hafidz', nrp: '5026231192', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Realasa Femmi Novelika', nrp: '5026231113', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Muhammad Faiz Roihan', nrp: '5026231098', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Tahiyyah Mufhimah', nrp: '5026231170', dept: 'IA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Fachry Ananda Akmal', nrp: '5026241025', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Rifqi Ahnaf Novanto', nrp: '5026241118', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Hanif Syahnandra', nrp: '5026241176', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Raditya Prazenko Reswara', nrp: '5026241155', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Dziky Fajryan Noersyafitrah', nrp: '5026241151', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Nayla Rameyza Alya', nrp: '5026241059', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Pande Made Yonata Axel Eldrian', nrp: '5026241018', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Khalisa Aulia Zahra', nrp: '5026241077', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Yesica Ingrita Manik', nrp: '5026241072', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Ramdhan Zulfikri', nrp: '5026241106', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Lenno Andhika Pramudya A.', nrp: '5026241057', dept: 'IA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Avissa Riyandita Putri', nrp: '5026241190', dept: 'IA', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Raffi Deva Anargya', nrp: '5026231104', dept: 'SWF', pos: 'Ketua Departemen', batch: '2023' },
    { name: 'Yudhistira Armico Fidly', nrp: '5026231067', dept: 'SWF', pos: 'Wakil Ketua Departemen', batch: '2023' },
    { name: 'Muhammad Abyan Tsabit Amani', nrp: '5026231163', dept: 'SWF', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Daniel Setiawan Yulius Putra', nrp: '5026231010', dept: 'SWF', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Erika Cahya Ningtyas', nrp: '5051231037', dept: 'SWF', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Gelar Ridho Ramadhan', nrp: '5026241045', dept: 'SWF', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Mursito Aji', nrp: '5026241142', dept: 'SWF', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Nashiwa Insan Muflih', nrp: '5026241143', dept: 'SWF', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Elfa Setiana', nrp: '5026241208', dept: 'SWF', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Aludra Nadia Salwa', nrp: '5026241098', dept: 'SWF', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Salsa Aulia Azzahra Havenanda', nrp: '5026241019', dept: 'SWF', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Nafisa Putri Az Zahroh', nrp: '5026241184', dept: 'SWF', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Akbar Ilman Setijadi', nrp: '5026241111', dept: 'SWF', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Firmansyah Adi Prasetyo', nrp: '5026231085', dept: 'RTA', pos: 'Ketua Departemen', batch: '2023' },
    { name: 'Hafidz Putra Dermawan', nrp: '5026231211', dept: 'RTA', pos: 'Wakil Ketua Departemen', batch: '2023' },
    { name: 'Akhtar Zia Faizarrobbi', nrp: '5026231095', dept: 'RTA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Yusuf Acala Sadurjaya Sri Krisna', nrp: '5026231089', dept: 'RTA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Bimo Rajendra Widyadhana', nrp: '5026231210', dept: 'RTA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Burju Ferdinand Harianja', nrp: '5026231066', dept: 'RTA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Ahmad Maulana Al Farel Rizantha', nrp: '5026241114', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Yustisio Priyatno', nrp: '5026241104', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Kania Putri Baihakim', nrp: '5051241032', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Fahmi Gema Fadilla', nrp: '5026241200', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Andien Yulia Lestari', nrp: '5051241019', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Eka Destriana Putri', nrp: '5026241164', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Ary Ratna Aida Safa', nrp: '5026241029', dept: 'RTA', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Milawati', nrp: '5026241163', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Laurentius Lafrellio Soewandi', nrp: '5026241102', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Maria Stephanie Febryana Kristijanto', nrp: '5026241052', dept: 'RTA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Naufal Erwin', nrp: '5026231152', dept: 'IM', pos: 'Ketua Departemen', batch: '2023' },
    { name: 'Farrel Aditya Rosyidi', nrp: '5026231177', dept: 'IM', pos: 'Wakil Ketua Departemen', batch: '2023' },
    { name: 'Hafizhan Yusra Sulistyo', nrp: '5026231060', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Ida Bagus Adhiraga Yudhistira', nrp: '5026231120', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Mirza Fathi Taufiqurrahman', nrp: '5026231105', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Kayla Nathania Azzahra', nrp: '5026231151', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Adityo Rafi Wardhana', nrp: '5026231209', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Michelle Lea Amanda', nrp: '5026231214', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Mukhammad Bagas Aditya', nrp: '5026241011', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2024' },
    { name: 'Tiara Aulia Azadirachta Indica', nrp: '5026231148', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Beh Siu Li', nrp: '5026231065', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Shifly Taysir Setiawan', nrp: '5026231046', dept: 'IM', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Achlano Affan Rasyad', nrp: '5051241031', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Ghazy', nrp: '5026241134', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Gusti Ayu Wedha Putri Surya', nrp: '5026241083', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Rizqy Aulia', nrp: '5026241084', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Dinny Maria Pical', nrp: '5051241026', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Ailsa Des Daneela', nrp: '5026241116', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Sylvia Nadia Maharani', nrp: '5026241160', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Tavasya Alia Anjani', nrp: '5026241067', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Fabio Andrea Liui', nrp: '5026241146', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Syahdu Szenovera Maharani', nrp: '5026241038', dept: 'IM', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Haura Rahiva Syahla', nrp: '5026241056', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Fasha Asshofa', nrp: '5026241095', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Mario Bimawan Setyo', nrp: '5051241007', dept: 'IM', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Auliya Malika Idi', nrp: '5026231141', dept: 'EA', pos: 'Ketua Departemen', batch: '2023' },
    { name: 'Muhammad Daniel Alfarisi', nrp: '5026231161', dept: 'EA', pos: 'Wakil Ketua Departemen', batch: '2023' },
    { name: 'Burhan Shidqi Arrasyid', nrp: '5026231074', dept: 'EA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Khalila Shafarayhani Atletiko', nrp: '5026231167', dept: 'EA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Fadhiil Akmal Hamizan', nrp: '5026231128', dept: 'EA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Irhab Faiz Hidayat', nrp: '5051231041', dept: 'EA', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Rofifah Zain Nur Alfiyah', nrp: '5026241131', dept: 'EA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Izzan Aquilla', nrp: '5026241069', dept: 'EA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Aliya Nur Kamila Silia', nrp: '5026241008', dept: 'EA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Mahda Veika', nrp: '5026241050', dept: 'EA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Naina Mazaya Putri', nrp: '5026241183', dept: 'EA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Mega Agustina Sihombing', nrp: '5026241165', dept: 'EA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Mazaya Zharfani Erfindri', nrp: '5026241138', dept: 'EA', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Alwida Rahmat', nrp: '5026241090', dept: 'EA', pos: 'Bendahara Departemen', batch: '2024' },
    { name: 'Athilah Syahshiyah Tsabita', nrp: '5026241031', dept: 'EA', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Muhammad Afiq Ridha Pratama', nrp: '5051231030', dept: 'ES', pos: 'Ketua Departemen', batch: '2023' },
    { name: 'Diffa Adzra Anelya', nrp: '5051231021', dept: 'ES', pos: 'Wakil Ketua Departemen', batch: '2023' },
    { name: 'Faradita Syaharani Murdiyana', nrp: '5051231009', dept: 'ES', pos: 'Bendahara Departemen', batch: '2023' },
    { name: 'Widda Farrah Kayla', nrp: '5026241119', dept: 'ES', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Naufal Zahran Ahnafi Yusup', nrp: '5051231016', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Syamil Rizqy Rayvianda Agil', nrp: '5051231031', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Adhharul Haqqullah', nrp: '5051231007', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Mohammad Wahyu Dwi N.', nrp: '5051231025', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Ahmed Miftah Ghiffari', nrp: '5026231102', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Sahilah Amru Yumnatusta', nrp: '5026231182', dept: 'ES', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Faiz Willy Abiyyu', nrp: '5026241166', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Fauzan Azura', nrp: '5026241161', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Athallah Hilman Hilalazka', nrp: '5026241145', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Fawzy Muhammad Dzaake', nrp: '5026241064', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Hanifiansyah', nrp: '5026241136', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Maria Arum Ningtyas', nrp: '5026241026', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Yudith Zharifah Utami', nrp: '5026241015', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Aurelyo Nouvabryano Akhmad', nrp: '5026241175', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Rivansyah Fathur Rozaq', nrp: '5026241088', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Ida Bagus Putu Dharma Yudhana', nrp: '5026241195', dept: 'ES', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Zaskia Muazatun M', nrp: '5026231021', dept: 'SOCDEV', pos: 'Ketua Departemen', batch: '2023' },
    { name: 'Ayu Alfia Putri', nrp: '5026231033', dept: 'SOCDEV', pos: 'Wakil Ketua Departemen', batch: '2023' },
    { name: 'Imtiyaz Shafhal Afif', nrp: '5026231197', dept: 'SOCDEV', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Lita Sari Banjarnahor', nrp: '5026231029', dept: 'SOCDEV', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Bagas Rafi Dewantara', nrp: '5026231091', dept: 'SOCDEV', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Nadya Luthfiyah Rahma', nrp: '5026231023', dept: 'SOCDEV', pos: 'Staff Ahli Departemen', batch: '2023' },
    { name: 'Ahmad Farhad Mabrury', nrp: '5026241034', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Akhmad Syauqi Rifan Fathoni', nrp: '5026241021', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Erfan Zidni', nrp: '5026241177', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Aisyah Nabilah Putri', nrp: '5026241141', dept: 'SOCDEV', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Athaya Hafidz Furqon A.', nrp: '5026241173', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Zalfa Fathiyah Adila', nrp: '5051241029', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Dimas Ananda Destariansyah', nrp: '5026241113', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Muhammad Akhtar Maulana B.', nrp: '5026241139', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Jennifer Nabiila Nanda Hariani', nrp: '5026241022', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Izzana Firdaunnisa', nrp: '5026241203', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'M. Khadavi Khalid', nrp: '5026241181', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Riu Shandy Lintar Pratama', nrp: '5026241046', dept: 'SOCDEV', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Maulana Muhammad Ad-Dzikri', nrp: '5026231136', dept: 'MANAGE', pos: 'Ketua Departemen', batch: '2023' },
    { name: 'Jasmine Fathina Hakim', nrp: '5026231017', dept: 'MANAGE', pos: 'Wakil Ketua Departemen', batch: '2023' },
    { name: 'Rafi Bartie Putra Nayar', nrp: '5026241178', dept: 'MANAGE', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Ruminureast Channing', nrp: '5026241125', dept: 'MANAGE', pos: 'Staff Departemen', batch: '2024' },
    { name: 'Husna Sabela', nrp: '5026241205', dept: 'MANAGE', pos: 'Sekretaris Departemen', batch: '2024' },
    { name: 'Naufatuzaki Auliazahra Marjuki', nrp: '5026241032', dept: 'MANAGE', pos: 'Staff Departemen', batch: '2024' },
];

async function seed() {
    let connection;
    try {
        // Koneksi awal tanpa menentukan database untuk memastikan DB ada
        const tempConn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        await tempConn.end();

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('🚀 Terkoneksi ke database!');

        // 1. Buat Tabel Departemen
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(20) NOT NULL,
                fullname VARCHAR(100),
                color VARCHAR(10)
            )
        `);

        // 2. Buat Tabel Members
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                nrp VARCHAR(20) UNIQUE NOT NULL,
                dept_name VARCHAR(20),
                pos VARCHAR(50),
                batch VARCHAR(10),
                score DECIMAL(5,2) DEFAULT NULL,
                band VARCHAR(30) DEFAULT NULL
            )
        `);

        // 3. Buat Tabel Assessments
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                p1_1 INT, p1_2 INT, p1_3 INT, p1_4 INT,
                p2_1 INT, p2_2 INT, p2_3 INT, p2_4 INT,
                p3_1 INT, p3_2 INT, p3_3 INT, p3_4 INT,
                p4_1 INT, p4_2 INT, p4_3 INT, p4_4 INT,
                total_score DECIMAL(5,2),
                band VARCHAR(50),
                appreciation TEXT,
                suggestions TEXT,
                personal_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (member_id) REFERENCES members(id)
            )
        `);

        console.log('📂 Struktur tabel siap.');

        // Hapus data lama agar bersih
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE members');
        await connection.execute('TRUNCATE TABLE departments');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        // Seed Departments
        for (const d of MOCK_DEPTS) {
            await connection.execute(
                'INSERT INTO departments (name, fullname, color) VALUES (?, ?, ?)',
                [d.name, d.fullname, d.color]
            );
        }
        console.log('✅ 10 Departemen berhasil dimasukkan.');

        // Seed Members
        for (const m of MOCK_MEMBERS) {
            await connection.execute(
                'INSERT INTO members (name, nrp, dept_name, pos, batch) VALUES (?, ?, ?, ?, ?)',
                [m.name, m.nrp, m.dept, m.pos, m.batch]
            );
        }
        console.log(`✅ ${MOCK_MEMBERS.length} Anggota berhasil dimasukkan.`);

    } catch (err) {
        console.error('❌ Terjadi kesalahan:', err.message);
    } finally {
        if (connection) await connection.end();
        console.log('🏁 Selesai.');
    }
}

seed();
