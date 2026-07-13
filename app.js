// ══════════════════════════════════════════════════════════
//  HMSI PILAR AKSI — App Logic
// ══════════════════════════════════════════════════════════

// ── HELPERS ─────────────────────────────────────────────────
function getBandClass(band) {
    const map = {
        'Outstanding': 'badge-outstanding',
        'Excellent': 'badge-excellent',
        'Very Good': 'badge-verygood',
        'Good': 'badge-good',
        'Fair': 'badge-fair',
        'Needs Improvement': 'badge-needs',
    };
    return map[band] || 'badge-good';
}

function getInitials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function getAvatarColor(idx) {
    return AVATARCOLORS[idx % AVATARCOLORS.length];
}

function getPeriodLabel(period) {
    return period === 'END_YEAR' ? 'End-Year 2026' : 'Mid-Year 2026';
}

// ── AUTH ───────────────────────────────────────────────────
const TOKEN_KEY = 'rapotAuthToken';
const USER_KEY = 'rapotAuthUser';
let CURRENT_USER = null;

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (err) {
        return null;
    }
}

function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    CURRENT_USER = user;
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    CURRENT_USER = null;
}

// Wraps fetch() with the Authorization header; forces re-login on 401.
async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        clearSession();
        showLoginScreen('Sesi berakhir, silakan login kembali.');
        throw new Error('Sesi berakhir, silakan login kembali.');
    }
    return res;
}

function showLoginScreen(errorMsg) {
    const loginScreen = document.getElementById('login-screen');
    const appShell = document.getElementById('app-shell');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appShell) appShell.style.display = 'none';

    const errEl = document.getElementById('login-error');
    if (errEl) {
        if (errorMsg) {
            errEl.textContent = errorMsg;
            errEl.style.display = 'block';
        } else {
            errEl.style.display = 'none';
        }
    }
}

function showApp() {
    const loginScreen = document.getElementById('login-screen');
    const appShell = document.getElementById('app-shell');
    if (loginScreen) loginScreen.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';
    renderUserBadge();
}

function renderUserBadge() {
    if (!CURRENT_USER) return;
    const isAdmin = CURRENT_USER.role === 'EB';
    const roleLabel = isAdmin ? 'Super Admin (EB)' : `${CURRENT_USER.dept_name || '-'} Department`;
    const initials = isAdmin ? 'EB' : (CURRENT_USER.dept_name || '??').slice(0, 2).toUpperCase();

    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const badgeEl = document.getElementById('topbar-user-badge');

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = CURRENT_USER.username;
    if (roleEl) roleEl.textContent = roleLabel;
    if (badgeEl) badgeEl.innerHTML = `<i class="fas fa-user-circle"></i> ${roleLabel}`;
}

async function login(username, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login gagal.');
    setSession(data.token, data.user);
}

function logout() {
    clearSession();
    showLoginScreen();
}

async function checkAuthOnLoad() {
    const token = getToken();
    const storedUser = getStoredUser();
    if (!token || !storedUser) {
        showLoginScreen();
        return false;
    }
    try {
        const res = await authFetch(`${API_URL}/auth/me`);
        if (!res.ok) throw new Error('invalid session');
        const data = await res.json();
        CURRENT_USER = data.user;
        showApp();
        return true;
    } catch (err) {
        clearSession();
        showLoginScreen();
        return false;
    }
}

// ── NAVIGATION ───────────────────────────────────────────────
function showPage(pageId, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    if (el) el.classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        members: 'Functional Members',
        departments: 'Departments',
        assessment: 'Assessment Input',
        'report-preview': 'Report Cards',
        analytics: 'Analytics',
        settings: 'Settings',
    };
    document.getElementById('topbar-title').textContent = titles[pageId] || pageId;
    if (pageId === 'analytics') updateAnalyticsCharts();
}

function showReportPage(idx, btn) {
    for (let i = 0; i < 6; i++) {
        const page = document.getElementById('rp-' + i);
        if (i === idx) {
            if (page.classList.contains('cover-page') || page.classList.contains('perf-page')) {
                page.style.display = 'flex';
                if (page.classList.contains('perf-page')) setTimeout(initRadarChart, 100);
            } else {
                page.style.display = 'block';
            }
        } else {
            page.style.display = 'none';
        }
    }
    document.querySelectorAll('.page-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ── RENDER: TOP PERFORMERS TABLE ─────────────────────────────
function renderTopPerformers() {
    const tbody = document.getElementById('top-performers-table');
    const withScore = MEMBERS_DATA.filter(m => m.score !== null);
    const sorted = withScore.sort((a, b) => b.score - a.score).slice(0, 10);

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">Belum ada data assessment untuk periode ini</td></tr>`;
        return;
    }

    tbody.innerHTML = sorted.map((m, i) => `
        <tr>
            <td><span class="rank-tag ${i < 3 ? 'rank-' + (i + 1) : 'rank-n'}">${i + 1}</span></td>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="member-avatar" style="background:${getAvatarColor(i)};color:white;">${getInitials(m.name)}</div>
                    <span style="font-weight:500;color:var(--text-primary);font-size:13px;">${m.name}</span>
                </div>
            </td>
            <td>${m.dept}</td>
            <td><b style="color:var(--text-primary)">${m.score}</b></td>
            <td><span class="badge ${getBandClass(m.band)}">${m.band}</span></td>
        </tr>
    `).join('');
}

// ── RENDER: DEPARTMENT RANKINGS ──────────────────────────────
function renderDeptRankings() {
    const el = document.getElementById('dept-ranking-list');
    const deptAvgs = {};
    DEPTS_DATA.forEach(d => { deptAvgs[d.name] = { sum: 0, count: 0 }; });
    MEMBERS_DATA.forEach(m => {
        if (m.score !== null && deptAvgs[m.dept_name]) {
            deptAvgs[m.dept_name].sum += parseFloat(m.score);
            deptAvgs[m.dept_name].count += 1;
        }
    });

    // Non-EB accounts only ever see their own department — a "ranking"
    // across a single department isn't meaningful, so show a note instead.
    if (CURRENT_USER && CURRENT_USER.role !== 'EB') {
        el.innerHTML = `<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:16px;">Department rankings hanya tersedia untuk akun EB.</div>`;
        return;
    }

    const depts = DEPTS_DATA.map(d => ({
        ...d,
        computedAvg: deptAvgs[d.name] && deptAvgs[d.name].count > 0
            ? +(deptAvgs[d.name].sum / deptAvgs[d.name].count).toFixed(1)
            : null,
    }));

    const sorted = [...depts].sort((a, b) => (b.computedAvg || 0) - (a.computedAvg || 0));

    el.innerHTML = sorted.map((d, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #F0F5FA;">
            <span class="rank-tag ${i < 3 ? 'rank-' + (i + 1) : 'rank-n'}" style="flex-shrink:0;">${i + 1}</span>
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${d.name}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${d.computedAvg || 0}%;background:linear-gradient(90deg,${d.color},${d.color}88);"></div>
                </div>
            </div>
            <div style="font-size:14px;font-weight:800;color:var(--text-primary);min-width:40px;text-align:right;">${d.computedAvg ?? '—'}</div>
        </div>
    `).join('');
}

function renderMembersTable(filteredData = MEMBERS_DATA) {
    const tbody = document.getElementById('members-table-body');
    const countEl = document.getElementById('members-count');

    if (countEl) countEl.textContent = `${filteredData.length} anggota`;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;">Belum ada data anggota</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredData.map((m, i) => `
        <tr>
            <td>
                <div class="member-cell">
                    <div class="member-avatar" style="background:${getAvatarColor(i)};color:white;">${getInitials(m.name)}</div>
                    <span class="member-name">${m.name}</span>
                </div>
            </td>
            <td style="font-family:monospace;font-size:12px;">${m.nrp}</td>
            <td>${m.dept_name}</td>
            <td>${m.pos}</td>
            <td>${m.batch}</td>
            <td><b style="color:var(--text-primary)">${m.score ?? '—'}</b></td>
            <td>
                ${m.score
            ? `<span class="badge ${getBandClass(m.band)}">${m.band}</span>`
            : '<span style="font-size:12px;color:var(--text-muted);">Pending</span>'}
            </td>
            <td>
                <div style="display:flex;gap:6px;justify-content:center;">
                    <button class="topbar-action btn-outline" title="Isi Assessment" style="padding:4px 10px;font-size:11px;"
                        onclick="goToMemberAssessment('${m.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="topbar-action btn-outline" title="Lihat Rapot" style="padding:4px 10px;font-size:11px;"
                        onclick="goToMemberReport('${m.id}')">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Row actions on the Functional Members table: PDF icon opens that member's
// report card, edit icon opens that member's assessment input — both must
// select the clicked row's member, not whatever was previously selected.
function goToMemberAssessment(memberId) {
    const select = document.getElementById('assessment-member-select');
    if (select) {
        select.value = memberId;
        loadAssessmentForm();
    }
    showPage('assessment', document.querySelectorAll('.nav-item')[3]);
}

function goToMemberReport(memberId) {
    const select = document.getElementById('report-member-select');
    if (select) {
        select.value = memberId;
        updateReportCover(memberId);
    }
    showPage('report-preview', document.querySelectorAll('.nav-item')[4]);
}

function showLoadingRows() {
    const tbody = document.getElementById('members-table-body');
    const topTbody = document.getElementById('top-performers-table');
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;"><i class="fas fa-spinner fa-spin"></i> Memuat data...</td></tr>`;
    if (topTbody) topTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;"><i class="fas fa-spinner fa-spin"></i> Memuat data...</td></tr>`;
}

function handleFilters() {
    const dept = document.getElementById('filter-dept').value;
    const batch = document.getElementById('filter-batch').value;
    const band = document.getElementById('filter-band').value;

    const filtered = MEMBERS_DATA.filter(m => {
        const matchDept = !dept || m.dept_name === dept;
        const matchBatch = !batch || m.batch === batch;
        const matchBand = !band || m.band === band;
        return matchDept && matchBatch && matchBand;
    });

    renderMembersTable(filtered);
}

function updateMemberCount() {
    const badge = document.querySelector('.nav-badge');
    if (badge) badge.textContent = MEMBERS_DATA.length;

    // Total Members
    const statValBlue = document.querySelector('.stat-card.blue .stat-value');
    if (statValBlue) statValBlue.textContent = MEMBERS_DATA.length;

    // Aggregating Assessment Data
    const membersWithScore = MEMBERS_DATA.filter(m => m.score !== null);

    // Assessments Done
    const statValGreen = document.querySelector('.stat-card.green .stat-value');
    if (statValGreen) statValGreen.textContent = membersWithScore.length;
    const statChangeGreen = document.querySelector('.stat-card.green .stat-change');
    if (statChangeGreen) statChangeGreen.textContent = `dari ${MEMBERS_DATA.length} anggota`;

    // Avg Performance
    const statValGold = document.querySelector('.stat-card.gold .stat-value');
    const statChangeGold = document.querySelector('.stat-card.gold .stat-change');
    if (membersWithScore.length > 0) {
        const sum = membersWithScore.reduce((a, b) => a + parseFloat(b.score), 0);
        const avg = (sum / membersWithScore.length).toFixed(1);
        if (statValGold) statValGold.textContent = avg;
        if (statChangeGold) {
            statChangeGold.textContent = `Berdasarkan assessment ${getPeriodLabel(CURRENT_PERIOD)}`;
            statChangeGold.className = 'stat-change positive';
        }
    } else {
        if (statValGold) statValGold.textContent = '—';
        if (statChangeGold) {
            statChangeGold.textContent = 'Belum ada assessment';
            statChangeGold.className = 'stat-change neutral';
        }
    }
}

function renderDeptCards() {
    const grid = document.getElementById('dept-cards-grid');
    grid.innerHTML = DEPTS_DATA.map(d => {
        const memberCount = MEMBERS_DATA.filter(m => m.dept_name === d.name).length;
        return `
        <div class="dept-card">
            <div class="dept-icon-wrap">
                <img src="Logo Departemen/${d.name}.png" alt="${d.name}" style="width:26px;height:26px;object-fit:contain;">
            </div>
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:var(--text-primary);">${d.name}</div>
                <div style="font-size:11px;color:var(--text-muted);">${d.fullname}</div>
                <div style="display:flex;gap:12px;margin-top:8px;">
                    <span style="font-size:11px;color:var(--text-secondary);"><b style="color:var(--text-primary)">${memberCount}</b> anggota</span>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// ── ASSESSMENT ───────────────────────────────────────────────
function selectRating(btn, val) {
    const group = btn.closest('.rating-btns');
    group.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    calcTotalScore();
}

function calcTotalScore() {
    const selected = document.querySelectorAll('.rating-btn.selected');
    const liveEl = document.getElementById('total-score-live');
    updateAssessmentSubmitState(selected.length);

    if (selected.length < 16) {
        liveEl.textContent = `${selected.length}/16 diisi`;
        return;
    }

    const ratings = Array.from(selected).map(b => parseInt(b.textContent));

    // Pilar 1: 4 indikator (bobot 22%)
    const p1Sum = ratings.slice(0, 4).reduce((a, b) => a + b, 0);
    const p1Score = (p1Sum / 16) * 22;

    // Pilar 2: 4 indikator (bobot 25%)
    const p2Sum = ratings.slice(4, 8).reduce((a, b) => a + b, 0);
    const p2Score = (p2Sum / 16) * 25;

    // Pilar 3: 4 indikator (bobot 23%)
    const p3Sum = ratings.slice(8, 12).reduce((a, b) => a + b, 0);
    const p3Score = (p3Sum / 16) * 23;

    // Pilar 4: 4 indikator (bobot 30%)
    const p4Sum = ratings.slice(12, 16).reduce((a, b) => a + b, 0);
    const p4Score = (p4Sum / 16) * 30;

    const totalScore = (p1Score + p2Score + p3Score + p4Score).toFixed(1);
    liveEl.textContent = totalScore;
}

function updateAssessmentSubmitState(selectedCount = document.querySelectorAll('.rating-btn.selected').length) {
    const disabled = selectedCount < 16;
    const btn1 = document.getElementById('assessment-submit-btn');
    const btn2 = document.getElementById('assessment-submit-btn-2');
    if (btn1) btn1.disabled = disabled;
    if (btn2) btn2.disabled = disabled;
}

function resetAssessmentForm() {
    document.querySelectorAll('.rating-btn.selected').forEach(b => b.classList.remove('selected'));
    const liveEl = document.getElementById('total-score-live');
    if (liveEl) liveEl.textContent = '0/16 diisi';
    document.getElementById('assessment-appreciation').value = '';
    document.getElementById('assessment-suggestions').value = '';
    document.getElementById('assessment-message').value = '';
    updateAssessmentSubmitState(0);
}

// Fetches the existing assessment (if any) for the selected member+period
// and prefills the form so editing an already-submitted assessment works.
async function loadAssessmentForm() {
    const memberId = document.getElementById('assessment-member-select').value;
    const periodSelect = document.getElementById('assessment-period-select');
    const period = periodSelect ? periodSelect.value : 'MID_YEAR';

    resetAssessmentForm();
    if (!memberId) return;

    try {
        const res = await authFetch(`${API_URL}/assessments/${memberId}?period=${period}`);
        if (!res.ok) return; // e.g. 403 out of scope — leave form empty
        const assessment = await res.json();
        if (!assessment) return;

        const ratings = [
            assessment.p1_1, assessment.p1_2, assessment.p1_3, assessment.p1_4,
            assessment.p2_1, assessment.p2_2, assessment.p2_3, assessment.p2_4,
            assessment.p3_1, assessment.p3_2, assessment.p3_3, assessment.p3_4,
            assessment.p4_1, assessment.p4_2, assessment.p4_3, assessment.p4_4
        ];

        document.querySelectorAll('#page-assessment .rating-btns').forEach((group, i) => {
            const val = ratings[i];
            const btn = Array.from(group.querySelectorAll('.rating-btn')).find(b => parseInt(b.textContent) === val);
            if (btn) btn.classList.add('selected');
        });

        document.getElementById('assessment-appreciation').value = assessment.appreciation || '';
        document.getElementById('assessment-suggestions').value = assessment.suggestions || '';
        document.getElementById('assessment-message').value = assessment.personal_message || '';

        calcTotalScore();
    } catch (err) {
        console.error('Gagal memuat assessment yang sudah ada:', err);
    }
}

async function submitAssessment() {
    const memberId = document.getElementById('assessment-member-select').value;
    const periodSelect = document.getElementById('assessment-period-select');
    const period = periodSelect ? periodSelect.value : 'MID_YEAR';

    const selectedBtns = document.querySelectorAll('.rating-btn.selected');
    if (!memberId || selectedBtns.length < 16) {
        alert('Harap pilih anggota dan isi semua 16 penilaian!');
        return;
    }

    const ratings = Array.from(selectedBtns).map(b => parseInt(b.textContent));

    const notes = {
        appreciation: document.getElementById('assessment-appreciation').value,
        suggestions: document.getElementById('assessment-suggestions').value,
        message: document.getElementById('assessment-message').value
    };

    try {
        // Score/band are computed by the backend from `ratings` — anything
        // sent from here is informational only and never trusted server-side.
        const res = await authFetch(`${API_URL}/assessments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, period, ratings, notes })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

        resetAssessmentForm();
        await refreshData();
        showPage('dashboard', document.querySelectorAll('.nav-item')[0]);
    } catch (err) {
        alert('Gagal menyimpan raport: ' + err.message);
    }
}

// ══════════════════════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════════════════════
let chartsInit = false;
let radarInit = false;
let analyticsInit = false;

function initDashboardCharts() {
    if (chartsInit) return;
    chartsInit = true;

    const dist = [0, 0, 0, 0, 0, 0];
    MEMBERS_DATA.forEach(m => {
        if (m.score !== null) {
            if (m.band === 'Outstanding') dist[0]++;
            else if (m.band === 'Excellent') dist[1]++;
            else if (m.band === 'Very Good') dist[2]++;
            else if (m.band === 'Good') dist[3]++;
            else if (m.band === 'Fair') dist[4]++;
            else if (m.band === 'Needs Improvement') dist[5]++;
        }
    });

    window.dashboardScoreChart = new Chart(document.getElementById('scoreDistChart'), {
        type: 'bar',
        data: {
            labels: ['Outstanding\n95–100', 'Excellent\n85–94', 'Very Good\n75–84', 'Good\n65–74', 'Fair\n50–64', 'Needs Imp.'],
            datasets: [{
                label: 'Jumlah Anggota',
                data: dist,
                backgroundColor: ['#FDF3C8', '#DBE9F8', '#F0FDF4', '#F5F3FF', '#FFF7ED', '#FEF2F2'],
                borderColor: ['#D4A017', '#1E56A0', '#22C55E', '#8B5CF6', '#C2410C', '#B91C1C'],
                borderWidth: 1.5, borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#F0F5FA' }, ticks: { font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            },
        },
    });

    // Monthly Trend
    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: ['Agt', 'Sep', 'Okt', 'Nov', 'Des', 'Jan'],
            datasets: [{
                label: 'Avg Score',
                data: [null, null, null, null, null, null],
                borderColor: '#1E56A0', borderWidth: 2.5,
                pointBackgroundColor: '#1E56A0', pointRadius: 4,
                tension: 0.4, fill: true,
                backgroundColor: ctx => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                    g.addColorStop(0, 'rgba(30,86,160,.15)');
                    g.addColorStop(1, 'rgba(30,86,160,0)');
                    return g;
                },
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 0, max: 100, grid: { color: '#F0F5FA' }, ticks: { font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            },
        },
    });
}

function initRadarChart() {
    if (radarInit) return;
    radarInit = true;
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'radar',
        data: {
            labels: ['Responsiveness', 'Initiative', 'Openness', 'Collaboration', 'Contribution', 'Task Completion', 'Innovation', 'Impact', 'Communication', 'Teamwork', 'Harmony', 'Aspirations', 'Timeliness', 'Quality', 'Discipline', 'Comm. Effect.'],
            datasets: [{
                label: 'Ahmad Rizky',
                data: [4, 3, 4, 3, 4, 4, 3, 4, 4, 4, 3, 3, 3, 4, 3, 4],
                borderColor: '#1E56A0', borderWidth: 2,
                backgroundColor: 'rgba(30,86,160,.12)',
                pointBackgroundColor: '#1E56A0', pointRadius: 3,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    min: 0, max: 4, ticks: { stepSize: 1, font: { size: 9 } },
                    grid: { color: '#E4ECF5' },
                    pointLabels: { font: { size: 9 }, color: '#4A5C7A' },
                },
            },
        },
    });
}

let analyticsCharts = { radar: null, deptCompare: null, band: null };

async function updateAnalyticsCharts() {
    const emptyEl = document.getElementById('analytics-empty');
    const contentEl = document.getElementById('analytics-content');
    if (!emptyEl || !contentEl) return;

    let analytics;
    try {
        const res = await authFetch(`${API_URL}/analytics?period=${CURRENT_PERIOD}`);
        analytics = await res.json();
    } catch (err) {
        console.error('Gagal memuat analytics:', err);
        return;
    }

    const departments = analytics.departments || [];
    const hasAnyAssessment = departments.some(d => Number(d.assessed_count) > 0);

    if (!hasAnyAssessment) {
        emptyEl.style.display = 'block';
        contentEl.style.display = 'none';
        return;
    }
    emptyEl.style.display = 'none';
    contentEl.style.display = 'block';

    // Avg per Pilar — Radar (computed from currently loaded, scoped MEMBERS_DATA average band mix isn't
    // available per-pillar from the API, so this stays a members-level aggregate of what's on screen).
    const scoredMembers = MEMBERS_DATA.filter(m => m.score !== null);
    const overallAvg = scoredMembers.length
        ? scoredMembers.reduce((a, b) => a + parseFloat(b.score), 0) / scoredMembers.length
        : 0;

    if (analyticsCharts.radar) analyticsCharts.radar.destroy();
    analyticsCharts.radar = new Chart(document.getElementById('avgRadarChart'), {
        type: 'radar',
        data: {
            labels: ['Adaptif & Proaktif', 'Berdampak & Bernilai', 'Humanis & Kekeluargaan', 'Optimalisasi & Prof.'],
            datasets: [
                { label: 'Rata-rata', data: [overallAvg, overallAvg, overallAvg, overallAvg], borderColor: '#1E56A0', backgroundColor: 'rgba(30,86,160,.1)', borderWidth: 2, pointRadius: 4 },
            ]
        },
        options: {
            responsive: true,
            scales: { r: { min: 0, max: 100, grid: { color: '#F0F5FA' }, pointLabels: { font: { size: 11 } } } },
            plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
        },
    });

    // Dept Compare — Bar (real data from /api/analytics; hidden entirely for DEPT accounts
    // via the department list already being scoped to just their own department server-side)
    const sortedDepts = [...departments].sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0));
    if (analyticsCharts.deptCompare) analyticsCharts.deptCompare.destroy();
    analyticsCharts.deptCompare = new Chart(document.getElementById('deptCompareChart'), {
        type: 'bar',
        data: {
            labels: sortedDepts.map(d => d.name),
            datasets: [{
                label: 'Dept Average',
                data: sortedDepts.map(d => d.avg_score ? +parseFloat(d.avg_score).toFixed(1) : 0),
                backgroundColor: sortedDepts.map(d => (d.color || '#1E56A0') + '40'),
                borderColor: sortedDepts.map(d => d.color || '#1E56A0'),
                borderWidth: 1.5, borderRadius: 6,
            }]
        },
        options: {
            responsive: true, indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { min: 0, max: 100, grid: { color: '#F0F5FA' }, ticks: { font: { size: 11 } } },
                y: { grid: { display: false }, ticks: { font: { size: 11 } } },
            },
        },
    });

    // Band Distribution — real data from /api/analytics
    const bandOrder = ['Outstanding', 'Excellent', 'Very Good', 'Good', 'Fair', 'Needs Improvement'];
    const bandCounts = bandOrder.map(band => {
        const row = (analytics.bandDistribution || []).find(b => b.band === band);
        return row ? Number(row.count) : 0;
    });
    if (analyticsCharts.band) analyticsCharts.band.destroy();
    analyticsCharts.band = new Chart(document.getElementById('bandChart'), {
        type: 'bar',
        data: {
            labels: bandOrder,
            datasets: [{
                label: 'Members',
                data: bandCounts,
                backgroundColor: ['#FDF3C8', '#DBE9F8', '#F0FDF4', '#F5F3FF', '#FFF7ED', '#FEF2F2'],
                borderColor: ['#D4A017', '#1E56A0', '#22C55E', '#8B5CF6', '#C2410C', '#B91C1C'],
                borderWidth: 1.5, borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#F0F5FA' }, ticks: { font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            },
        },
    });

    analyticsInit = true;
}

// ── CONFIG ──────────────────────────────────────────────────
const API_URL = '/api';
let MEMBERS_DATA = [];
let DEPTS_DATA = [];
let CURRENT_PERIOD = 'MID_YEAR';

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('login-submit-btn');
            if (btn) btn.disabled = true;
            try {
                await login(username, password);
                showApp();
                await initAppData();
            } catch (err) {
                showLoginScreen(err.message);
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    const authed = await checkAuthOnLoad();
    if (authed) {
        await initAppData();
    }
});

async function initAppData() {
    const globalPeriodSelect = document.getElementById('global-period-select');
    if (globalPeriodSelect) {
        globalPeriodSelect.value = CURRENT_PERIOD;
        globalPeriodSelect.addEventListener('change', async () => {
            CURRENT_PERIOD = globalPeriodSelect.value;
            analyticsInit = false;
            await refreshData();
            if (document.getElementById('page-analytics').classList.contains('active')) {
                updateAnalyticsCharts();
            }
        });
    }

    await refreshData();
    setTimeout(initDashboardCharts, 100);

    // Filters (Members page)
    const filterDept = document.getElementById('filter-dept');
    const filterBatch = document.getElementById('filter-batch');
    const filterBand = document.getElementById('filter-band');
    if (filterDept) filterDept.addEventListener('change', handleFilters);
    if (filterBatch) filterBatch.addEventListener('change', handleFilters);
    if (filterBand) filterBand.addEventListener('change', handleFilters);

    // Assessment form: reset + prefill whenever member or period changes
    const assessmentMemberSelect = document.getElementById('assessment-member-select');
    const assessmentPeriodSelect = document.getElementById('assessment-period-select');
    if (assessmentMemberSelect) assessmentMemberSelect.addEventListener('change', loadAssessmentForm);
    if (assessmentPeriodSelect) assessmentPeriodSelect.addEventListener('change', loadAssessmentForm);
    updateAssessmentSubmitState(0);

    // Report card: re-render whenever period changes (member change already
    // triggers updateReportCover via its own onchange in index.html)
    const reportPeriodSelect = document.getElementById('report-period-select');
    if (reportPeriodSelect) {
        reportPeriodSelect.addEventListener('change', () => {
            const memberSelect = document.getElementById('report-member-select');
            updateReportCover(memberSelect ? memberSelect.value : '');
        });
    }
}

async function refreshData() {
    try {
        showLoadingRows();
        const [mRes, dRes] = await Promise.all([
            authFetch(`${API_URL}/members?period=${CURRENT_PERIOD}`),
            authFetch(`${API_URL}/departments`)
        ]);
        const rawMembers = await mRes.json();
        DEPTS_DATA = await dRes.json();

        // Ensure legacy fields match
        MEMBERS_DATA = rawMembers.map(m => ({
            ...m,
            dept: m.dept_name
        }));

        updateMemberCount();
        renderTopPerformers();
        renderDeptRankings();
        renderMembersTable();
        renderDeptCards();
        populateMemberDropdown();

        if (chartsInit) {
            updateDashboardCharts();
        }
    } catch (err) {
        console.error('Gagal mengambil data:', err);
    }
}

function updateDashboardCharts() {
    if (!window.dashboardScoreChart) return;
    const dist = [0, 0, 0, 0, 0, 0];
    MEMBERS_DATA.forEach(m => {
        if (m.score !== null) {
            if (m.band === 'Outstanding') dist[0]++;
            else if (m.band === 'Excellent') dist[1]++;
            else if (m.band === 'Very Good') dist[2]++;
            else if (m.band === 'Good') dist[3]++;
            else if (m.band === 'Fair') dist[4]++;
            else if (m.band === 'Needs Improvement') dist[5]++;
        }
    });
    window.dashboardScoreChart.data.datasets[0].data = dist;
    window.dashboardScoreChart.update();
}

function populateMemberDropdown() {
    const select = document.getElementById('assessment-member-select');
    if (!select) return;

    const previousValue = select.value;
    select.innerHTML = '<option value="">Pilih Anggota...</option>' +
        MEMBERS_DATA.map(m => `<option value="${m.id}">${m.name} (${m.dept_name})</option>`).join('');
    if (previousValue && MEMBERS_DATA.some(m => String(m.id) === previousValue)) {
        select.value = previousValue;
    }

    // Also populate report preview dropdown
    populateReportDropdown();
}

function populateReportDropdown() {
    const select = document.getElementById('report-member-select');
    if (!select) return;

    const previousValue = select.value;
    select.innerHTML = '<option value="">— Pilih Anggota —</option>' +
        MEMBERS_DATA.map(m => `<option value="${m.id}">${m.name} (${m.dept_name})</option>`).join('');

    if (previousValue && MEMBERS_DATA.some(m => String(m.id) === previousValue)) {
        select.value = previousValue;
        updateReportCover(previousValue);
    } else {
        // Initialize cover with empty placeholders
        updateReportCover("");
    }
}

function updateReportCover(memberId) {
    const nameEl = document.getElementById('cover-member-name');
    const infoEl = document.getElementById('cover-member-info');
    const deptEl = document.getElementById('cover-member-dept');

    if (!memberId) {
        if (nameEl) nameEl.textContent = '[ Nama Anggota ]';
        if (infoEl) infoEl.textContent = '[ NRP ] - [ Posisi ]';
        if (deptEl) deptEl.textContent = 'Departemen ...';
        const perfInfo = document.getElementById('perf-info-section');
        if (perfInfo) perfInfo.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:60px 20px;">Belum memilih anggota</div>';
        return;
    }

    const member = MEMBERS_DATA.find(m => String(m.id) === String(memberId));
    if (!member) return;

    // Find department full name
    const dept = DEPTS_DATA.find(d => d.name === member.dept_name) ||
        DEPTS_DATA.find(d => d.name === member.dept);
    const deptFullname = dept ? dept.fullname : (member.dept_name || member.dept);

    const initialsEl = document.getElementById('cover-initials');

    let posText = member.pos.toUpperCase();
    posText = posText.replace("DEPARTEMEN", (member.dept_name || member.dept).toUpperCase());

    if (initialsEl) initialsEl.textContent = getInitials(member.name);
    if (nameEl) nameEl.textContent = member.name;
    if (infoEl) infoEl.textContent = `${member.nrp} - ${posText}`;
    if (deptEl) deptEl.textContent = `Departemen ${deptFullname}`;

    // Update performance page
    updateReportPerformance(memberId, member, posText, deptFullname);
}

function getReportPeriod() {
    const sel = document.getElementById('report-period-select');
    return sel ? sel.value : 'MID_YEAR';
}

// Guards against a stale response overwriting a newer one when the user
// switches member/period quickly (each call gets an incrementing token;
// only the most recent call is allowed to render).
let reportRequestToken = 0;

async function updateReportPerformance(memberId, member, posText, deptFullname) {
    const perfInfo = document.getElementById('perf-info-section');
    if (!perfInfo) return;

    if (!memberId) {
        perfInfo.innerHTML = '';
        return;
    }

    const period = getReportPeriod();
    const requestId = ++reportRequestToken;

    // Clear stale content immediately so switching members never leaves the
    // previous member's performance page/chart/feedback on screen while the
    // new data is in flight (or if the fetch below fails).
    perfInfo.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:60px 20px;"><i class="fas fa-spinner fa-spin"></i> Memuat data...</div>`;
    if (window.perfRadarChartInstance) {
        window.perfRadarChartInstance.destroy();
        window.perfRadarChartInstance = null;
    }
    const fbAppreciation = document.getElementById('fb-appreciation');
    const fbSuggestions = document.getElementById('fb-suggestions');
    const fbMessage = document.getElementById('fb-message');
    if (fbAppreciation) fbAppreciation.innerHTML = '-';
    if (fbSuggestions) fbSuggestions.innerHTML = '-';
    if (fbMessage) fbMessage.innerHTML = '-';
    const closeScoreEl = document.getElementById('close-final-score');
    const closeBandEl = document.getElementById('close-performance-band');
    const closeRankEl = document.getElementById('close-cabinet-rank');
    if (closeScoreEl) closeScoreEl.textContent = '-';
    if (closeBandEl) closeBandEl.textContent = '-';
    if (closeRankEl) closeRankEl.textContent = '-';

    try {
        const [res, rankRes] = await Promise.all([
            authFetch(`${API_URL}/assessments/${memberId}?period=${period}`),
            authFetch(`${API_URL}/rankings?period=${period}`)
        ]);
        const assessment = res.ok ? await res.json() : null;
        const rankings = rankRes.ok ? await rankRes.json() : [];

        if (requestId !== reportRequestToken) return; // superseded by a newer request

        let p1Score = 0, p2Score = 0, p3Score = 0, p4Score = 0;
        let totalScore = 0;
        let band = 'Pending';
        if (assessment) {
            p1Score = [assessment.p1_1, assessment.p1_2, assessment.p1_3, assessment.p1_4].reduce((a, b) => a + b, 0) / 16 * 22;
            p2Score = [assessment.p2_1, assessment.p2_2, assessment.p2_3, assessment.p2_4].reduce((a, b) => a + b, 0) / 16 * 25;
            p3Score = [assessment.p3_1, assessment.p3_2, assessment.p3_3, assessment.p3_4].reduce((a, b) => a + b, 0) / 16 * 23;
            p4Score = [assessment.p4_1, assessment.p4_2, assessment.p4_3, assessment.p4_4].reduce((a, b) => a + b, 0) / 16 * 30;
            totalScore = (p1Score + p2Score + p3Score + p4Score).toFixed(1);
            band = assessment.band || member.band;
        }

        // Cabinet Rank — computed from `rankings` (org-wide, all departments
        // combined via /api/rankings), never from the possibly dept-scoped
        // MEMBERS_DATA, so DEPT-role accounts see their true cabinet-wide rank.
        let cabinetRank = '-';
        if (assessment) {
            const idx = rankings.findIndex(r => String(r.id) === String(member.id));
            cabinetRank = idx >= 0 ? idx + 1 : '-';
        }
        const cabinetTotal = rankings.length;

        const deptMembers = MEMBERS_DATA.filter(m => m.dept_name === member.dept_name);
        const scoredDeptMembers = deptMembers.filter(m => m.score !== null && m.score !== undefined).sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

        let deptAvg = '-';
        if (scoredDeptMembers.length > 0) {
            const sum = scoredDeptMembers.reduce((acc, m) => acc + parseFloat(m.score), 0);
            deptAvg = (sum / scoredDeptMembers.length).toFixed(1);
        }

        if (!assessment) {
            perfInfo.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:60px 20px;">Belum ada assessment untuk ${getPeriodLabel(period)}</div>`;
            document.getElementById('fb-appreciation').innerHTML = '-';
            document.getElementById('fb-suggestions').innerHTML = '-';
            document.getElementById('fb-message').innerHTML = '-';
            const closeScore = document.getElementById('close-final-score');
            const closeBand = document.getElementById('close-performance-band');
            const closeRank = document.getElementById('close-cabinet-rank');
            if (closeScore) closeScore.textContent = '-';
            if (closeBand) closeBand.textContent = '-';
            if (closeRank) closeRank.textContent = '-';
            if (window.perfRadarChartInstance) {
                window.perfRadarChartInstance.destroy();
                window.perfRadarChartInstance = null;
            }
            return;
        }

        perfInfo.innerHTML = `
            <div style="display:flex; flex-direction:column; width:100%; height:100%; box-sizing:border-box; transform: scale(0.9); transform-origin: top center;">

                <!-- Top Banner -->
                <div style="background: linear-gradient(135deg, #3b60e4, #92d9ec); border-radius:16px; padding:30px 40px; display:flex; align-items:center; margin-bottom:30px;">
                    <div style="width:90px; height:90px; border-radius:50%; background:#d1d5db; display:flex; align-items:center; justify-content:center; overflow:hidden; box-shadow: 0 0 0 3px rgba(255,255,255,0.3); margin-right:24px; flex-shrink:0;">
                        ${member.id == 1 ? '<img src="Logo PILAR AKSI.png" style="width:100%; height:100%; object-fit:cover;">' : `<div style="font-size:32px; font-weight:800; color:#3b60e4;">${getInitials(member.name)}</div>`}
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:24px; font-weight:800; color:white; margin-bottom: 2px;">
                            ${member.name}
                        </div>
                        <div style="font-size:14px; color:rgba(255,255,255,0.9); letter-spacing:0.5px; margin-bottom: 4px;">
                            NRP. ${member.nrp}
                        </div>
                        <div style="font-size:14px; color:white; font-weight:600;">
                            Departemen ${member.dept} &bull; ${posText}
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:rgba(255,255,255,0.8); margin-bottom:4px;">
                            Assessment Period
                        </div>
                        <div style="font-size:16px; font-weight:700; color:white;">
                            ${getPeriodLabel(period).toUpperCase()}
                        </div>
                    </div>
                </div>

                <!-- Below Banner -->
                <div style="display:flex; flex-direction:row; gap:40px;">
                    <!-- Left Side: Pilar -->
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="font-size:14px; font-weight:800; color:#8ba0b8; letter-spacing:0.5px; margin-bottom:24px;">
                            SKOR PER PILAR
                        </div>
                        <div style="display:flex; flex-direction:column; gap:20px;">
                            <!-- Pilar 1 -->
                            <div>
                                <div style="font-size:12px; font-weight:700; color:#4A5C7A; margin-bottom:8px;">P1 &bull; Adaptif &amp; Proaktif</div>
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="flex:1; height:8px; background:#e0e7ee; border-radius:4px; overflow:hidden;">
                                        <div style="height:100%; width:${(Math.min(p1Score / 22 * 100, 100))}%; background:#3b60e4; border-radius:4px;"></div>
                                    </div>
                                    <div style="font-size:13px; font-weight:800; color:#1a3a5c; min-width:46px; text-align:right;">${p1Score > 0 ? p1Score.toFixed(1) : '-'}<span style="font-size:10px; color:#8ba0b8; font-weight:600;">/22</span></div>
                                </div>
                            </div>
                            <!-- Pilar 2 -->
                            <div>
                                <div style="font-size:12px; font-weight:700; color:#4A5C7A; margin-bottom:8px;">P2 &bull; Berdampak &amp; Bernilai</div>
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="flex:1; height:8px; background:#e0e7ee; border-radius:4px; overflow:hidden;">
                                        <div style="height:100%; width:${(Math.min(p2Score / 25 * 100, 100))}%; background:#eab308; border-radius:4px;"></div>
                                    </div>
                                    <div style="font-size:13px; font-weight:800; color:#1a3a5c; min-width:46px; text-align:right;">${p2Score > 0 ? p2Score.toFixed(1) : '-'}<span style="font-size:10px; color:#8ba0b8; font-weight:600;">/25</span></div>
                                </div>
                            </div>
                            <!-- Pilar 3 -->
                            <div>
                                <div style="font-size:12px; font-weight:700; color:#4A5C7A; margin-bottom:8px;">P3 &bull; Humanis &amp; Kekeluargaan</div>
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="flex:1; height:8px; background:#e0e7ee; border-radius:4px; overflow:hidden;">
                                        <div style="height:100%; width:${(Math.min(p3Score / 23 * 100, 100))}%; background:#22c55e; border-radius:4px;"></div>
                                    </div>
                                    <div style="font-size:13px; font-weight:800; color:#1a3a5c; min-width:46px; text-align:right;">${p3Score > 0 ? p3Score.toFixed(1) : '-'}<span style="font-size:10px; color:#8ba0b8; font-weight:600;">/23</span></div>
                                </div>
                            </div>
                            <!-- Pilar 4 -->
                            <div>
                                <div style="font-size:12px; font-weight:700; color:#4A5C7A; margin-bottom:8px;">P4 &bull; Optimalisasi &amp; Profesionalisme</div>
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="flex:1; height:8px; background:#e0e7ee; border-radius:4px; overflow:hidden;">
                                        <div style="height:100%; width:${(Math.min(p4Score / 30 * 100, 100))}%; background:#a855f7; border-radius:4px;"></div>
                                    </div>
                                    <div style="font-size:13px; font-weight:800; color:#1a3a5c; min-width:46px; text-align:right;">${p4Score > 0 ? p4Score.toFixed(1) : '-'}<span style="font-size:10px; color:#8ba0b8; font-weight:600;">/30</span></div>
                                </div>
                            </div>
                        </div>
                        <div style="font-size:13px; font-weight:800; color:#8ba0b8; letter-spacing:0.5px; margin-top:50px; margin-bottom:10px; text-align:center;">
                            BREAKDOWN INDIKATOR
                        </div>
                        <div style="width:100%; height:340px; display:flex; justify-content:center; align-items:center;">
                            <canvas id="perfRadarChart"></canvas>
                        </div>
                    </div>

                    <!-- Right Side: Score & Ranking -->
                    <div style="width:230px; display:flex; flex-direction:column; gap:20px;">
                        <!-- Final Score Box -->
                        <div style="background: linear-gradient(135deg, #3b60e4, #5E9EE8); box-shadow: 0 4px 14px rgba(59,96,228,0.25); padding: 18px; border-radius: 12px; display:flex; flex-direction:column; align-items:center;">
                            <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.9);margin-bottom:8px;font-weight:600;">
                                Final Score</div>
                            <div style="color:#FFF8D6; font-size:48px; font-weight:800; line-height:1; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom: 6px;">${totalScore > 0 ? totalScore : '-'}</div>
                            <div style="color:rgba(255,255,255,.9); font-size:10px; margin-bottom: 8px; font-weight:500;">DARI 100</div>
                            <div style="color:white; font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px;">✦ ${band}</div>
                        </div>

                        <!-- Ranking Box -->
                        <div style="padding:16px; border-radius:12px; border:1px solid #e0e7ee; box-shadow:0 4px 12px rgba(0,0,0,0.04); background:white;">
                            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#1a3a5c;font-weight:800;margin-bottom:12px;">
                                Ranking</div>
                            <div style="padding:8px 0; border-bottom:1px solid #e0e7ee; display:flex; justify-content:space-between; align-items:center;">
                                <div style="font-size:11px; color:var(--text-muted); font-weight:500;">Cabinet Ranking</div>
                                <div style="color:#1a3a5c; font-weight:800; font-size:13px;">#${cabinetRank} <span style="font-size:9px;color:var(--text-muted);font-weight:600;">/${cabinetTotal}</span></div>
                            </div>
                            <div style="padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                                <div style="font-size:11px; color:var(--text-muted); font-weight:500;">Dept. Avg</div>
                                <div style="font-size:12px; color:#1a3a5c; font-weight:700;">${deptAvg}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        // Update Feedback Page (rp-4)
        document.getElementById('fb-appreciation').innerHTML = assessment?.appreciation || '-';
        document.getElementById('fb-suggestions').innerHTML = assessment?.suggestions || '-';
        document.getElementById('fb-message').innerHTML = assessment?.personal_message || '-';

        setTimeout(() => {
            if (requestId !== reportRequestToken) return; // a newer member/period was selected meanwhile

            const canvas = document.getElementById('perfRadarChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            if (window.perfRadarChartInstance) {
                window.perfRadarChartInstance.destroy();
            }

            const dataValues = assessment ? [
                assessment.p1_1, assessment.p1_2, assessment.p1_3, assessment.p1_4,
                assessment.p2_1, assessment.p2_2, assessment.p2_3, assessment.p2_4,
                assessment.p3_1, assessment.p3_2, assessment.p3_3, assessment.p3_4,
                assessment.p4_1, assessment.p4_2, assessment.p4_3, assessment.p4_4
            ] : Array(16).fill(0);

            const data = {
                labels: [
                    'Responsiveness', 'Initiative', 'Openness', 'Collaboration',
                    'Contribution', 'Task Completion', 'Innovation', 'Impact',
                    'Support. Comm.', 'Teamwork', 'Harmony', 'Aspirations',
                    'Timeliness', 'Quality', 'Discipline', 'Comm. Effect.'
                ],
                datasets: [{
                    label: 'Scores',
                    data: dataValues,
                    backgroundColor: 'rgba(59, 96, 228, 0.15)',
                    borderColor: 'rgba(59, 96, 228, 0.8)',
                    pointBackgroundColor: 'rgba(59, 96, 228, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(59, 96, 228, 1)'
                }]
            };

            const config = {
                type: 'radar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            min: 0,
                            max: 4,
                            angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                            pointLabels: {
                                font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" },
                                color: '#4A5C7A'
                            },
                            ticks: {
                                display: false,
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            };
            window.perfRadarChartInstance = new Chart(ctx, config);
        }, 100);

        // Update Closing Page
        const closeScore = document.getElementById('close-final-score');
        const closeBand = document.getElementById('close-performance-band');
        const closeRank = document.getElementById('close-cabinet-rank');
        if (closeScore) closeScore.textContent = assessment ? totalScore : '-';
        if (closeBand) closeBand.textContent = assessment ? band : '-';
        if (closeRank) {
            closeRank.innerHTML = assessment ? `#${cabinetRank}` : `-`;
        }

    } catch (err) {
        if (requestId === reportRequestToken) {
            console.error("Error fetching assessment", err);
            perfInfo.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:60px 20px;">Gagal memuat data assessment. Coba pilih ulang anggota.</div>`;
        }
    }
}

// ═════════════ PDF GENERATION ═════════════
async function downloadPDF() {
    const memberSelect = document.getElementById('report-member-select');
    const selectedId = memberSelect.value;

    if (!selectedId) {
        alert("Pilih anggota dari dropdown terlebih dahulu.");
        return;
    }

    const member = MEMBERS_DATA.find(m => String(m.id) === selectedId);
    let fileName = `Rapot_${member.name.replace(/\s+/g, '_')}.pdf`;

    // Ambil semua halaman
    const rpPages = document.querySelectorAll('.rp-page');
    const container = document.querySelector('.rp-wrapper');

    // Simpan styling UI original untuk direvert
    const originalStyles = [];

    rpPages.forEach(p => {
        originalStyles.push({
            display: p.style.display,
            borderRadius: p.style.borderRadius,
            border: p.style.border,
            boxShadow: p.style.boxShadow,
            marginBottom: p.style.marginBottom
        });

        // Strip UI styling for printing
        p.style.display = 'block';
        p.style.borderRadius = '0';
        p.style.border = 'none';
        p.style.boxShadow = 'none';
        p.style.marginBottom = '0';
    });

    const opt = {
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
        await html2pdf().set(opt).from(container).save();
    } catch (e) {
        console.error("Error generating PDF", e);
        alert("Terjadi kesalahan saat membuat PDF.");
    }

    // Revert kembali styling view
    rpPages.forEach((p, idx) => {
        p.style.display = originalStyles[idx].display;
        p.style.borderRadius = originalStyles[idx].borderRadius;
        p.style.border = originalStyles[idx].border;
        p.style.boxShadow = originalStyles[idx].boxShadow;
        p.style.marginBottom = originalStyles[idx].marginBottom;
    });
}
