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
    if (pageId === 'analytics') initAnalyticsCharts();
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
    const withScore = MOCK_MEMBERS.filter(m => m.score !== null);
    const sorted = withScore.sort((a, b) => b.score - a.score).slice(0, 10);

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">Belum ada data assessment</td></tr>`;
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
    // Hitung avg dari member yang sudah punya score
    const deptAvgs = {};
    MOCK_DEPTS.forEach(d => { deptAvgs[d.name] = { sum: 0, count: 0 }; });
    MOCK_MEMBERS.forEach(m => {
        if (m.score !== null && deptAvgs[m.dept]) {
            deptAvgs[m.dept].sum += m.score;
            deptAvgs[m.dept].count += 1;
        }
    });

    const depts = MOCK_DEPTS.map(d => ({
        ...d,
        computedAvg: deptAvgs[d.name].count > 0
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
            <div style="font-size:11px;color:var(--text-muted);min-width:44px;text-align:right;">${d.members} mbr</div>
        </div>
    `).join('');
}

// ── RENDER: MEMBERS TABLE ────────────────────────────────────
function renderMembersTable() {
    const tbody = document.getElementById('members-table-body');
    tbody.innerHTML = MOCK_MEMBERS.map((m, i) => `
        <tr>
            <td>
                <div class="member-avatar" style="background:${getAvatarColor(i)};color:white;">${getInitials(m.name)}</div>
                <div style="font-weight:500;color:var(--text-primary);font-size:13px;margin-top:4px;">${m.name}</div>
            </td>
            <td style="font-family:monospace;font-size:12px;">${m.nrp}</td>
            <td>${m.dept}</td>
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
                    <button class="topbar-action btn-outline" style="padding:4px 10px;font-size:11px;"><i class="fas fa-edit"></i></button>
                    <button class="topbar-action btn-outline" style="padding:4px 10px;font-size:11px;"
                        onclick="showPage('report-preview', document.querySelectorAll('.nav-item')[4])">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update sidebar badge count
function updateMemberCount() {
    const badge = document.querySelector('.nav-badge');
    if (badge) badge.textContent = MOCK_MEMBERS.length;
    // stat card
    const statVal = document.querySelector('.stat-card.blue .stat-value');
    if (statVal) statVal.textContent = MOCK_MEMBERS.length;
}

// ── RENDER: DEPT CARDS ───────────────────────────────────────
function renderDeptCards() {
    const grid = document.getElementById('dept-cards-grid');
    grid.innerHTML = MOCK_DEPTS.map(d => `
        <div class="dept-card">
            <div style="width:42px;height:42px;border-radius:10px;background:${d.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i class="fas fa-layer-group" style="color:${d.color};font-size:18px;"></i>
            </div>
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:var(--text-primary);">${d.name}</div>
                <div style="font-size:11px;color:var(--text-muted);">${d.fullname}</div>
                <div style="display:flex;gap:12px;margin-top:8px;">
                    <span style="font-size:11px;color:var(--text-secondary);"><b style="color:var(--text-primary)">${d.members}</b> anggota</span>
                    <span style="font-size:11px;color:var(--text-secondary);">avg <b style="color:${d.color}">${d.avg ?? '—'}</b></span>
                </div>
            </div>
        </div>
    `).join('');
}

// ── ASSESSMENT ───────────────────────────────────────────────
function selectRating(btn, val) {
    const group = btn.closest('.rating-btns');
    group.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function calcTotalScore() {
    const selected = document.querySelectorAll('.rating-btn.selected');
    const liveEl = document.getElementById('total-score-live');
    if (selected.length < 16) {
        liveEl.textContent = `${selected.length}/16 diisi`;
        return;
    }
    let total = 0;
    selected.forEach(b => { total += parseInt(b.textContent); });
    const score = (total / (16 * 4) * 100).toFixed(1);
    liveEl.textContent = score;
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

    // Score Distribution
    new Chart(document.getElementById('scoreDistChart'), {
        type: 'bar',
        data: {
            labels: ['Outstanding\n95–100', 'Excellent\n85–94', 'Very Good\n75–84', 'Good\n65–74', 'Fair\n50–64', 'Needs Imp.'],
            datasets: [{
                label: 'Jumlah Anggota',
                data: [0, 0, 0, 0, 0, 0], // akan berisi 0 karena belum ada assessment
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

function initAnalyticsCharts() {
    if (analyticsInit) return;
    analyticsInit = true;

    // Avg per Pilar — Radar
    new Chart(document.getElementById('avgRadarChart'), {
        type: 'radar',
        data: {
            labels: ['Adaptif & Proaktif', 'Berdampak & Bernilai', 'Humanis & Kekeluargaan', 'Optimalisasi & Prof.'],
            datasets: [
                { label: 'HMSI Avg', data: [0, 0, 0, 0], borderColor: '#1E56A0', backgroundColor: 'rgba(30,86,160,.1)', borderWidth: 2, pointRadius: 4 },
            ]
        },
        options: {
            responsive: true,
            scales: { r: { min: 0, grid: { color: '#F0F5FA' }, pointLabels: { font: { size: 11 } } } },
            plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
        },
    });

    // Dept Compare — Bar
    const sorted = [...MOCK_DEPTS].sort((a, b) => (b.avg || 0) - (a.avg || 0));
    new Chart(document.getElementById('deptCompareChart'), {
        type: 'bar',
        data: {
            labels: sorted.map(d => d.name),
            datasets: [{
                label: 'Dept Average',
                data: sorted.map(d => d.avg || 0),
                backgroundColor: sorted.map(d => d.color + '40'),
                borderColor: sorted.map(d => d.color),
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

    // Band Distribution
    new Chart(document.getElementById('bandChart'), {
        type: 'bar',
        data: {
            labels: ['Outstanding', 'Excellent', 'Very Good', 'Good', 'Fair', 'Needs Improv.'],
            datasets: [{
                label: 'Members',
                data: [0, 0, 0, 0, 0, 0],
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
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateMemberCount();
    renderTopPerformers();
    renderDeptRankings();
    renderMembersTable();
    renderDeptCards();
    setTimeout(initDashboardCharts, 100);
});