const AdmZip = require('adm-zip');
const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 5000;

const DATA_FILE       = path.join(__dirname, 'students.json');
const FEES_FILE       = path.join(__dirname, 'fees.json');
const ATTENDANCE_FILE = path.join(__dirname, 'attendance.json');
const RESULTS_FILE    = path.join(__dirname, 'results.json');

// ── File helpers ──────────────────────────────────────────────────────────────

function readStudents()      { try { return JSON.parse(fs.readFileSync(DATA_FILE,       'utf8')); } catch { return []; } }
function writeStudents(d)    { fs.writeFileSync(DATA_FILE,       JSON.stringify(d, null, 2), 'utf8'); }
function readFees()          { try { return JSON.parse(fs.readFileSync(FEES_FILE,       'utf8')); } catch { return []; } }
function writeFees(d)        { fs.writeFileSync(FEES_FILE,       JSON.stringify(d, null, 2), 'utf8'); }
function readAttendance()    { try { return JSON.parse(fs.readFileSync(ATTENDANCE_FILE, 'utf8')); } catch { return []; } }
function writeAttendance(d)  { fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(d, null, 2), 'utf8'); }
function readResults()       { try { return JSON.parse(fs.readFileSync(RESULTS_FILE,    'utf8')); } catch { return []; } }
function writeResults(d)     { fs.writeFileSync(RESULTS_FILE,    JSON.stringify(d, null, 2), 'utf8'); }

// ── HTML Page ─────────────────────────────────────────────────────────────────

const HTML_PAGE = `<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>جامعہ عائشہ صدیقہ للبنات</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --p:#0b3d2e;--pl:#1a5c3a;--pd:#061e17;
  --ac:#c9a84c;--al:#f0c840;
  --bg:#eef4ee;--cb:#fff;
  --bd:#cde0cd;--tm:#555;
  --sh:0 4px 20px rgba(0,0,0,.13);
  --r:12px;
}
body{font-family:'Noto Nastaliq Urdu',serif;background:var(--bg);color:#1a1a1a;min-height:100vh;direction:rtl;line-height:1.9}

/* ── Header ── */
.hdr{background:linear-gradient(135deg,var(--pd),var(--p) 55%,var(--pl));color:#fff;position:sticky;top:0;z-index:100;box-shadow:var(--sh)}
.hdr-top{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,.1);flex-wrap:wrap;gap:10px}
.logo-wrap{display:flex;align-items:center;gap:14px}
.logo-ico{width:58px;height:58px;background:var(--ac);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 4px 14px rgba(201,168,76,.45);flex-shrink:0}
.logo-text h1{font-size:1.35rem;font-weight:700;color:var(--al);text-shadow:0 2px 4px rgba(0,0,0,.3)}
.logo-text p{font-size:.82rem;color:rgba(255,255,255,.75);margin-top:2px}
.bkp-btn{background:linear-gradient(135deg,var(--ac),var(--al));color:var(--pd);border:none;padding:9px 18px;border-radius:8px;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:7px;transition:.3s;box-shadow:0 4px 12px rgba(201,168,76,.4)}
.bkp-btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(201,168,76,.5)}

/* ── Nav Tabs ── */
.nav-tabs{display:flex;padding:0 22px;background:var(--pd);overflow-x:auto;scrollbar-width:none}
.nav-tabs::-webkit-scrollbar{display:none}
.nav-tab{padding:13px 18px;color:rgba(255,255,255,.65);cursor:pointer;border-bottom:3px solid transparent;transition:.3s;white-space:nowrap;font-size:.9rem;display:flex;align-items:center;gap:7px;user-select:none}
.nav-tab:hover{color:#fff;background:rgba(255,255,255,.06)}
.nav-tab.active{color:var(--al);border-bottom-color:var(--ac);background:rgba(201,168,76,.1)}

/* ── Main ── */
.main{max-width:1120px;margin:0 auto;padding:22px 14px}

/* ── Panels ── */
.panel{display:none;animation:fadeUp .3s ease}
.panel.active{display:block}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ── Cards ── */
.card{background:var(--cb);border-radius:var(--r);box-shadow:var(--sh);padding:22px;margin-bottom:22px;border:1px solid var(--bd)}
.card-hdr{display:flex;align-items:center;gap:11px;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid var(--bd)}
.card-ico{width:42px;height:42px;background:linear-gradient(135deg,var(--p),var(--pl));color:var(--ac);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
.card-hdr h2{font-size:1.1rem;color:var(--p);font-weight:700}

/* ── Stats ── */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:20px}
.stat{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;border-radius:11px;padding:18px;text-align:center;box-shadow:var(--sh)}
.stat-n{font-size:2rem;font-weight:700;color:var(--al);display:block}
.stat-l{font-size:.82rem;color:rgba(255,255,255,.8)}

/* ── Forms ── */
.fgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.fg{display:flex;flex-direction:column;gap:5px}
.fg.full{grid-column:1/-1}
label{font-size:.88rem;color:var(--p);font-weight:600}
input,select,textarea{padding:9px 13px;border:2px solid var(--bd);border-radius:8px;font-family:inherit;font-size:.88rem;color:#1a1a1a;background:#f8fff6;transition:.25s;direction:rtl;width:100%}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--pl);box-shadow:0 0 0 3px rgba(26,92,58,.14)}
textarea{resize:vertical;min-height:72px}

/* ── Buttons ── */
.btn{padding:11px 26px;border:none;border-radius:8px;font-family:inherit;font-size:.9rem;font-weight:700;cursor:pointer;transition:.3s;display:inline-flex;align-items:center;gap:7px}
.btn-p{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;box-shadow:0 4px 12px rgba(11,61,46,.3)}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(11,61,46,.4)}
.btn-s{background:linear-gradient(135deg,#5a6c7a,#7f8c8d);color:#fff}
.btn-d{background:linear-gradient(135deg,#b03020,#e74c3c);color:#fff;padding:5px 13px;font-size:.78rem;border-radius:6px}
.btn-d:hover{transform:translateY(-1px)}
.form-foot{margin-top:18px;text-align:left}

/* ── Tables ── */
.tbl-wrap{overflow-x:auto;border-radius:9px;border:1px solid var(--bd)}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff}
thead th{padding:11px 14px;text-align:right;white-space:nowrap;font-weight:600}
tbody tr{border-bottom:1px solid var(--bd);transition:.2s}
tbody tr:hover{background:rgba(26,92,58,.04)}
tbody td{padding:9px 14px;text-align:right;vertical-align:middle}

/* ── Attendance rows ── */
.att-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:11px 14px;margin-bottom:7px;background:#f8fff6;border:1px solid var(--bd);border-radius:9px}
.att-info-name{font-weight:600;color:var(--p)}
.att-info-sub{font-size:.8rem;color:var(--tm)}
.st-btns{display:flex;gap:7px;flex-wrap:wrap}
.st-btn{padding:5px 13px;border:2px solid;border-radius:6px;cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:600;transition:.2s;background:transparent}
.st-btn.pr{border-color:#27ae60;color:#27ae60} .st-btn.pr.sel{background:#27ae60;color:#fff}
.st-btn.ab{border-color:#e74c3c;color:#e74c3c} .st-btn.ab.sel{background:#e74c3c;color:#fff}
.st-btn.lv{border-color:#f39c12;color:#f39c12} .st-btn.lv.sel{background:#f39c12;color:#fff}

/* ── Grade badges ── */
.gb{padding:3px 11px;border-radius:20px;font-weight:700;font-size:.79rem;display:inline-block}
.gb-aplus{background:#d4efdf;color:#1a7a3a}
.gb-a{background:#d5f5e3;color:#1e8449}
.gb-b{background:#d6eaf8;color:#1a5276}
.gb-c{background:#fdebd0;color:#a04000}
.gb-d{background:#fef9c3;color:#7d6608}
.gb-f{background:#fadbd8;color:#922b21}

/* ── Toast ── */
#toast-box{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:7px;pointer-events:none}
.toast{padding:13px 22px;border-radius:10px;font-size:.88rem;font-weight:600;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:tdrop .3s ease,tfade .4s ease 2.5s forwards;text-align:center;min-width:260px}
.toast.ok{background:linear-gradient(135deg,#27ae60,#2ecc71)}
.toast.er{background:linear-gradient(135deg,#b03020,#e74c3c)}
@keyframes tdrop{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
@keyframes tfade{to{opacity:0;transform:translateY(-10px)}}

/* ── Empty / Spinner ── */
.empty{text-align:center;padding:36px;color:var(--tm)}
.empty i{font-size:2.6rem;margin-bottom:12px;color:var(--bd);display:block}
.spin{text-align:center;padding:18px;color:var(--tm)}

/* ── Footer ── */
.footer{text-align:center;padding:22px;color:var(--tm);font-size:.82rem;border-top:1px solid var(--bd);margin-top:36px}

/* ── Responsive ── */
@media(max-width:600px){
  .hdr-top{padding:10px 14px}
  .logo-text h1{font-size:1.1rem}
  .main{padding:14px 8px}
  .card{padding:14px}
  .fgrid{grid-template-columns:1fr}
  .bkp-btn span{display:none}
}
</style>
</head>
<body>

<div id="toast-box"></div>

<header class="hdr">
  <div class="hdr-top">
    <div class="logo-wrap">
      <div class="logo-ico">&#x1F54C;</div>
      <div class="logo-text">
        <h1>جامعہ عائشہ صدیقہ للبنات</h1>
        <p>تعلیمی مینجمنٹ سسٹم</p>
      </div>
    </div>
    <a href="/api/backup" class="bkp-btn">
      <i class="fa fa-download"></i>
      <span>ڈیٹا بیک اپ (ZIP)</span>
    </a>
  </div>
  <nav class="nav-tabs">
    <div class="nav-tab active" onclick="switchTab('admission',this)">
      <i class="fa fa-user-plus"></i> جدید داخلہ
    </div>
    <div class="nav-tab" onclick="switchTab('attendance',this)">
      <i class="fa fa-calendar-check"></i> روزانہ حاضری
    </div>
    <div class="nav-tab" onclick="switchTab('fees',this)">
      <i class="fa fa-money-bill-wave"></i> فیس کا اندراج
    </div>
    <div class="nav-tab" onclick="switchTab('results',this)">
      <i class="fa fa-graduation-cap"></i> امتحانی رزلٹ
    </div>
  </nav>
</header>

<main class="main">

  <!-- ══════════════════ ADMISSION ══════════════════ -->
  <div id="panel-admission" class="panel active">
    <div class="stats" id="adm-stats">
      <div class="stat"><span class="stat-n" id="st-total">—</span><span class="stat-l">کل طالبات</span></div>
      <div class="stat"><span class="stat-n" id="st-today">—</span><span class="stat-l">آج کے داخلے</span></div>
    </div>

    <div class="card">
      <div class="card-hdr">
        <div class="card-ico"><i class="fa fa-user-plus"></i></div>
        <h2>نئی طالبہ کا داخلہ فارم</h2>
      </div>
      <form id="adm-form">
        <div class="fgrid">
          <div class="fg">
            <label>طالبہ کا مکمل نام *</label>
            <input id="a-fullName" type="text" placeholder="مثال: فاطمہ بی بی" required>
          </div>
          <div class="fg">
            <label>والد کا نام *</label>
            <input id="a-fatherName" type="text" placeholder="مثال: محمد اکبر" required>
          </div>
          <div class="fg">
            <label>تاریخِ پیدائش *</label>
            <input id="a-dob" type="date" required>
          </div>
          <div class="fg">
            <label>بی فارم / شناختی نمبر *</label>
            <input id="a-bForm" type="text" placeholder="42301-1234567-1" required>
          </div>
          <div class="fg">
            <label>جماعت *</label>
            <select id="a-class" required>
              <option value="">— جماعت منتخب کریں —</option>
              <option>حفظ اول</option><option>حفظ دوم</option><option>حفظ سوم</option>
              <option>جماعت اول</option><option>جماعت دوم</option><option>جماعت سوم</option>
              <option>جماعت چہارم</option><option>جماعت پنجم</option>
              <option>درجہ اعدادیہ</option><option>درجہ خاص</option>
            </select>
          </div>
          <div class="fg">
            <label>سرپرست کا فون نمبر *</label>
            <input id="a-phone" type="tel" placeholder="03001234567" required>
          </div>
          <div class="fg full">
            <label>مکمل پتہ *</label>
            <textarea id="a-address" placeholder="گھر نمبر، گلی، محلہ، شہر" required></textarea>
          </div>
        </div>
        <div class="form-foot">
          <button type="submit" class="btn btn-p"><i class="fa fa-save"></i> داخلہ محفوظ کریں</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-hdr">
        <div class="card-ico"><i class="fa fa-list"></i></div>
        <h2>داخل طالبات کی فہرست</h2>
      </div>
      <div id="adm-list"><div class="spin"><i class="fa fa-spinner fa-spin"></i> لوڈ ہو رہا ہے...</div></div>
    </div>
  </div>

  <!-- ══════════════════ ATTENDANCE ══════════════════ -->
  <div id="panel-attendance" class="panel">
    <div class="card">
      <div class="card-hdr">
        <div class="card-ico"><i class="fa fa-calendar-check"></i></div>
        <h2>روزانہ حاضری</h2>
      </div>
      <div class="fgrid" style="margin-bottom:18px">
        <div class="fg">
          <label>تاریخ *</label>
          <input id="att-date" type="date" required>
        </div>
        <div class="fg" style="justify-content:flex-end">
          <label>&nbsp;</label>
          <button class="btn btn-s" onclick="loadAttendanceForm()"><i class="fa fa-refresh"></i> طالبات لوڈ کریں</button>
        </div>
      </div>
      <div id="att-rows">
        <div class="empty"><i class="fa fa-calendar"></i>تاریخ چن کر "طالبات لوڈ کریں" دبائیں</div>
      </div>
      <div id="att-save-wrap" style="display:none;margin-top:16px;text-align:left">
        <button class="btn btn-p" onclick="saveAttendance()"><i class="fa fa-save"></i> حاضری محفوظ کریں</button>
      </div>
    </div>

    <div class="card">
      <div class="card-hdr">
        <div class="card-ico"><i class="fa fa-history"></i></div>
        <h2>محفوظ شدہ حاضری کی تاریخیں</h2>
      </div>
      <div id="att-history"><div class="spin"><i class="fa fa-spinner fa-spin"></i> لوڈ ہو رہا ہے...</div></div>
    </div>
  </div>

  <!-- ══════════════════ FEES ══════════════════ -->
  <div id="panel-fees" class="panel">
    <div class="card">
      <div class="card-hdr">
        <div class="card-ico"><i class="fa fa-money-bill-wave"></i></div>
        <h2>فیس کا اندراج</h2>
      </div>
      <form id="fee-form">
        <div class="fgrid">
          <div class="fg">
            <label>طالبہ منتخب کریں *</label>
            <select id="f-student" required><option value="">— طالبہ —</option></select>
          </div>
          <div class="fg">
            <label>فیس کی رقم (روپے) *</label>
            <input id="f-amount" type="number" min="1" placeholder="500" required>
          </div>
          <div class="fg">
            <label>مہینہ *</label>
            <select id="f-month" required>
              <option value="">— مہینہ —</option>
              <option>جنوری</option><option>فروری</option><option>مارچ</option>
              <option>اپریل</option><option>مئی</option><option>جون</option>
              <option>جولائی</option><option>اگست</option><option>ستمبر</option>
              <option>اکتوبر</option><option>نومبر</option><option>دسمبر</option>
            </select>
          </div>
          <div class="fg">
            <label>سال *</label>
            <input id="f-year" type="number" min="2020" max="2099" placeholder="2025" required>
          </div>
        </div>
        <div class="form-foot">
          <button type="submit" class="btn btn-p"><i class="fa fa-save"></i> فیس محفوظ کریں</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-hdr">
        <div class="card-ico"><i class="fa fa-receipt"></i></div>
        <h2>فیس ریکارڈز</h2>
      </div>
      <div id="fee-list"><div class="spin"><i class="fa fa-spinner fa-spin"></i> لوڈ ہو رہا ہے...</div></div>
    </div>
  </div>

  <!-- ══════════════════ RESULTS ══════════════════ -->
  <div id="panel-results" class="panel">
    <div class="card">
      <div class="card-hdr">
        <div class="card-ico"><i class="fa fa-graduation-cap"></i></div>
        <h2>امتحانی نتیجہ درج کریں</h2>
      </div>
      <form id="res-form">
        <div class="fgrid">
          <div class="fg">
            <label>طالبہ *</label>
            <select id="r-student" required><option value="">— طالبہ —</option></select>
          </div>
          <div class="fg">
            <label>امتحان کا عنوان</label>
            <input id="r-title" type="text" placeholder="مثال: سالانہ امتحان ۲۰۲۵">
          </div>
          <div class="fg">
            <label>قرآن (100 میں سے) *</label>
            <input id="r-quran" type="number" min="0" max="100" placeholder="0–100" required>
          </div>
          <div class="fg">
            <label>تجوید (100 میں سے) *</label>
            <input id="r-tajweed" type="number" min="0" max="100" placeholder="0–100" required>
          </div>
          <div class="fg">
            <label>اردو (100 میں سے) *</label>
            <input id="r-urdu" type="number" min="0" max="100" placeholder="0–100" required>
          </div>
          <div class="fg">
            <label>دینیات (100 میں سے) *</label>
            <input id="r-dinyat" type="number" min="0" max="100" placeholder="0–100" required>
          </div>
          <div class="fg">
            <label>ریاضی (100 میں سے) *</label>
            <input id="r-math" type="number" min="0" max="100" placeholder="0–100" required>
          </div>
        </div>
        <div class="form-foot">
          <button type="submit" class="btn btn-p"><i class="fa fa-save"></i> نتیجہ محفوظ کریں</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-hdr">
        <div class="card-ico"><i class="fa fa-table"></i></div>
        <h2>نتائج کی فہرست</h2>
      </div>
      <div id="res-list"><div class="spin"><i class="fa fa-spinner fa-spin"></i> لوڈ ہو رہا ہے...</div></div>
    </div>
  </div>

</main>

<footer class="footer">
  <p>جامعہ عائشہ صدیقہ للبنات &mdash; تعلیمی مینجمنٹ سسٹم &copy; ${new Date().getFullYear()}</p>
</footer>

<script>
// ── State ─────────────────────────────────────────────────────
var students = [];
var attStatus = {};

// ── Tab switching ──────────────────────────────────────────────
function switchTab(name, el) {
  document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.nav-tab').forEach(function(t){ t.classList.remove('active'); });
  document.getElementById('panel-' + name).classList.add('active');
  el.classList.add('active');
  if (name === 'admission')  { loadStudents(); }
  if (name === 'attendance') { loadStudents(); loadAttendanceHistory(); setToday(); }
  if (name === 'fees')       { loadStudents(); loadFees(); }
  if (name === 'results')    { loadStudents(); loadResults(); }
}

// ── Toast ──────────────────────────────────────────────────────
function toast(msg, type) {
  var t = document.createElement('div');
  t.className = 'toast ' + (type === 'er' ? 'er' : 'ok');
  t.textContent = msg;
  document.getElementById('toast-box').appendChild(t);
  setTimeout(function(){ t.remove(); }, 3200);
}

// ── Helpers ────────────────────────────────────────────────────
function setToday() {
  var d = new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth()+1).padStart(2,'0');
  var day = String(d.getDate()).padStart(2,'0');
  var el = document.getElementById('att-date');
  if (el && !el.value) el.value = y+'-'+m+'-'+day;
  var fy = document.getElementById('f-year');
  if (fy && !fy.value) fy.value = y;
}

function gradeClass(g) {
  var map = {'A+':'aplus','A':'a','B':'b','C':'c','D':'d','F':'f'};
  return 'gb gb-' + (map[g] || 'f');
}

// ── Students ───────────────────────────────────────────────────
function loadStudents() {
  fetch('/api/students')
    .then(function(r){ return r.json(); })
    .then(function(data){
      students = data.students || [];
      renderStudentList();
      fillDropdowns();
      updateStats();
    })
    .catch(function(){ toast('طالبات لوڈ نہیں ہوئیں','er'); });
}

function fillDropdowns() {
  ['f-student','r-student'].forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="">— طالبہ منتخب کریں —</option>';
    students.forEach(function(s){
      var o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.fullName + ' (' + s.admissionClass + ')';
      el.appendChild(o);
    });
  });
}

function updateStats() {
  document.getElementById('st-total').textContent = students.length;
  var today = new Date().toLocaleDateString('ur-PK');
  var cnt = students.filter(function(s){ return s.admissionDate === today; }).length;
  document.getElementById('st-today').textContent = cnt;
}

function renderStudentList() {
  var c = document.getElementById('adm-list');
  if (!students.length) {
    c.innerHTML = '<div class="empty"><i class="fa fa-users"></i>ابھی کوئی طالبہ داخل نہیں ہے</div>';
    return;
  }
  var rows = students.map(function(s, i){
    return '<tr>' +
      '<td>' + (i+1) + '</td>' +
      '<td>' + s.fullName + '</td>' +
      '<td>' + s.fatherName + '</td>' +
      '<td>' + s.admissionClass + '</td>' +
      '<td>' + s.guardianPhone + '</td>' +
      '<td>' + (s.admissionDate || '—') + '</td>' +
      '<td><button class="btn btn-d" onclick="delStudent(' + s.id + ')"><i class="fa fa-trash"></i></button></td>' +
      '</tr>';
  }).join('');
  c.innerHTML = '<div class="tbl-wrap"><table>' +
    '<thead><tr><th>#</th><th>نام</th><th>والد</th><th>جماعت</th><th>فون</th><th>داخلہ تاریخ</th><th>حذف</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

// ── Admission form ─────────────────────────────────────────────
document.getElementById('adm-form').addEventListener('submit', function(e){
  e.preventDefault();
  var body = {
    fullName:       document.getElementById('a-fullName').value.trim(),
    fatherName:     document.getElementById('a-fatherName').value.trim(),
    dob:            document.getElementById('a-dob').value,
    bForm:          document.getElementById('a-bForm').value.trim(),
    admissionClass: document.getElementById('a-class').value,
    guardianPhone:  document.getElementById('a-phone').value.trim(),
    address:        document.getElementById('a-address').value.trim()
  };
  var form = this;
  fetch('/api/students', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }).then(function(r){ return r.json(); })
    .then(function(d){
      toast(d.message, d.success ? 'ok' : 'er');
      if (d.success) { form.reset(); loadStudents(); }
    })
    .catch(function(){ toast('سرور سے رابطہ نہیں ہو سکا','er'); });
});

function delStudent(id) {
  if (!confirm('کیا آپ واقعی اس طالبہ کا ریکارڈ حذف کرنا چاہتے ہیں؟')) return;
  fetch('/api/students/' + id, {method:'DELETE'})
    .then(function(r){ return r.json(); })
    .then(function(d){ toast(d.message, d.success ? 'ok' : 'er'); if(d.success) loadStudents(); })
    .catch(function(){ toast('حذف کرنے میں مسئلہ','er'); });
}

// ── Attendance ─────────────────────────────────────────────────
function loadAttendanceForm() {
  var date = document.getElementById('att-date').value;
  if (!date) { toast('پہلے تاریخ منتخب کریں','er'); return; }
  if (!students.length) { toast('طالبات دستیاب نہیں','er'); return; }
  attStatus = {};
  students.forEach(function(s){ attStatus[s.id] = 'حاضر'; });
  fetch('/api/attendance?date=' + date)
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (data.record && data.record.records) {
        data.record.records.forEach(function(r){ attStatus[r.studentId] = r.status; });
      }
      renderAttRows();
    })
    .catch(function(){ renderAttRows(); });
}

function renderAttRows() {
  var c = document.getElementById('att-rows');
  if (!students.length) {
    c.innerHTML = '<div class="empty"><i class="fa fa-users"></i>طالبات موجود نہیں</div>';
    return;
  }
  c.innerHTML = '';

  students.forEach(function(s) {
    var st = attStatus[s.id] || 'حاضر';

    var row = document.createElement('div');
    row.className = 'att-row';
    row.id = 'att-' + s.id;

    var info = document.createElement('div');
    var nameEl = document.createElement('div');
    nameEl.className = 'att-info-name';
    nameEl.textContent = s.fullName;

    var subEl = document.createElement('div');
    subEl.className = 'att-info-sub';
    subEl.textContent = s.fatherName + ' | ' + s.admissionClass;

    info.appendChild(nameEl);
    info.appendChild(subEl);

    var btnWrap = document.createElement('div');
    btnWrap.className = 'st-btns';

    function createStatusButton(status, label, typeClass) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'st-btn ' + typeClass + (st === status ? ' sel' : '');
      btn.textContent = label;
      btn.addEventListener('click', function() {
        setSt(s.id, status, btn);
      });
      return btn;
    }

    btnWrap.appendChild(createStatusButton('حاضر', 'حاضر', 'pr'));
    btnWrap.appendChild(createStatusButton('غیر حاضر', 'غیر حاضر', 'ab'));
    btnWrap.appendChild(createStatusButton('رخصت', 'رخصت', 'lv'));

    row.appendChild(info);
    row.appendChild(btnWrap);
    c.appendChild(row);
  });

  document.getElementById('att-save-wrap').style.display = 'block';
}

function setSt(id, status, btn) {
  attStatus[id] = status;
  var row = document.getElementById('att-' + id);
  row.querySelectorAll('.st-btn').forEach(function(b){ b.classList.remove('sel'); });
  btn.classList.add('sel');
}

function saveAttendance() {
  var date = document.getElementById('att-date').value;
  if (!date) { toast('تاریخ منتخب نہیں','er'); return; }
  var records = students.map(function(s){
    return { studentId:s.id, studentName:s.fullName, fatherName:s.fatherName,
             admissionClass:s.admissionClass, status: attStatus[s.id] || 'حاضر' };
  });
  fetch('/api/attendance', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({date:date, records:records})
  }).then(function(r){ return r.json(); })
    .then(function(d){ toast(d.message, d.success ? 'ok' : 'er'); if(d.success) loadAttendanceHistory(); })
    .catch(function(){ toast('حاضری محفوظ نہیں ہوئی','er'); });
}

function loadAttendanceHistory() {
  var c = document.getElementById('att-history');
  fetch('/api/attendance')
    .then(function(r){ return r.json(); })
    .then(function(data){
      var dates = data.dates || [];
      if (!dates.length) { c.innerHTML = '<div class="empty"><i class="fa fa-calendar-times"></i>کوئی ریکارڈ نہیں</div>'; return; }
      c.innerHTML = '<div class="tbl-wrap"><table><thead><tr><th>#</th><th>تاریخ</th></tr></thead><tbody>' +
        dates.map(function(d,i){ return '<tr><td>'+(i+1)+'</td><td>'+d+'</td></tr>'; }).join('') +
        '</tbody></table></div>';
    })
    .catch(function(){ c.innerHTML = '<div class="empty">تاریخ لوڈ نہیں ہوئی</div>'; });
}

// ── Fees ───────────────────────────────────────────────────────
document.getElementById('fee-form').addEventListener('submit', function(e){
  e.preventDefault();
  var body = {
    studentId: document.getElementById('f-student').value,
    amount:    document.getElementById('f-amount').value,
    month:     document.getElementById('f-month').value,
    year:      document.getElementById('f-year').value
  };
  var form = this;
  fetch('/api/fees', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }).then(function(r){ return r.json(); })
    .then(function(d){ toast(d.message, d.success ? 'ok' : 'er'); if(d.success){ form.reset(); loadFees(); } })
    .catch(function(){ toast('سرور سے رابطہ نہیں','er'); });
});

function loadFees() {
  var c = document.getElementById('fee-list');
  fetch('/api/fees')
    .then(function(r){ return r.json(); })
    .then(function(data){
      var fees = (data.fees || []).slice().reverse();
      if (!fees.length) { c.innerHTML = '<div class="empty"><i class="fa fa-money-bill-wave"></i>کوئی فیس ریکارڈ نہیں</div>'; return; }
      c.innerHTML = '<div class="tbl-wrap"><table>' +
        '<thead><tr><th>#</th><th>رسید</th><th>طالبہ</th><th>جماعت</th><th>رقم</th><th>مہینہ</th><th>سال</th><th>تاریخ</th><th>حذف</th></tr></thead><tbody>' +
        fees.map(function(f,i){
          return '<tr><td>'+(i+1)+'</td><td>'+f.receiptNo+'</td><td>'+f.studentName+'</td><td>'+f.admissionClass+'</td>' +
            '<td>Rs '+f.amount+'</td><td>'+f.month+'</td><td>'+f.year+'</td><td>'+(f.paymentDate||'—')+'</td>' +
            '<td><button class="btn btn-d" onclick="delFee('+f.id+')"><i class="fa fa-trash"></i></button></td></tr>';
        }).join('') + '</tbody></table></div>';
    })
    .catch(function(){ c.innerHTML = '<div class="empty">ریکارڈ لوڈ نہیں ہوا</div>'; });
}

function delFee(id) {
  if (!confirm('کیا آپ یہ فیس ریکارڈ حذف کرنا چاہتے ہیں؟')) return;
  fetch('/api/fees/' + id, {method:'DELETE'})
    .then(function(r){ return r.json(); })
    .then(function(d){ toast(d.message, d.success ? 'ok' : 'er'); if(d.success) loadFees(); })
    .catch(function(){ toast('حذف کرنے میں مسئلہ','er'); });
}

// ── Results ────────────────────────────────────────────────────
document.getElementById('res-form').addEventListener('submit', function(e){
  e.preventDefault();
  var body = {
    studentId: document.getElementById('r-student').value,
    examTitle: document.getElementById('r-title').value.trim() || 'سالانہ امتحان',
    quran:     document.getElementById('r-quran').value,
    tajweed:   document.getElementById('r-tajweed').value,
    urdu:      document.getElementById('r-urdu').value,
    dinyat:    document.getElementById('r-dinyat').value,
    math:      document.getElementById('r-math').value
  };
  var form = this;
  fetch('/api/results', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }).then(function(r){ return r.json(); })
    .then(function(d){ toast(d.message, d.success ? 'ok' : 'er'); if(d.success){ form.reset(); loadResults(); } })
    .catch(function(){ toast('سرور سے رابطہ نہیں','er'); });
});

function loadResults() {
  var c = document.getElementById('res-list');
  fetch('/api/results')
    .then(function(r){ return r.json(); })
    .then(function(data){
      var results = (data.results || []).slice().reverse();
      if (!results.length) { c.innerHTML = '<div class="empty"><i class="fa fa-graduation-cap"></i>کوئی نتیجہ نہیں</div>'; return; }
      c.innerHTML = '<div class="tbl-wrap"><table>' +
        '<thead><tr><th>#</th><th>طالبہ</th><th>جماعت</th><th>امتحان</th>' +
        '<th>قرآن</th><th>تجوید</th><th>اردو</th><th>دینیات</th><th>ریاضی</th>' +
        '<th>کل</th><th>فیصد</th><th>گریڈ</th><th>حذف</th></tr></thead><tbody>' +
        results.map(function(r,i){
          return '<tr><td>'+(i+1)+'</td><td>'+r.studentName+'</td><td>'+r.admissionClass+'</td><td>'+r.examTitle+'</td>' +
            '<td>'+r.marks.quran+'</td><td>'+r.marks.tajweed+'</td><td>'+r.marks.urdu+'</td>' +
            '<td>'+r.marks.dinyat+'</td><td>'+r.marks.math+'</td>' +
            '<td>'+r.totalObtained+'/500</td><td>'+r.percentage+'%</td>' +
            '<td><span class="'+gradeClass(r.grade)+'">'+r.grade+' — '+r.gradeLabel+'</span></td>' +
            '<td><button class="btn btn-d" onclick="delResult('+r.id+')"><i class="fa fa-trash"></i></button></td></tr>';
        }).join('') + '</tbody></table></div>';
    })
    .catch(function(){ c.innerHTML = '<div class="empty">نتائج لوڈ نہیں ہوئے</div>'; });
}

function delResult(id) {
  if (!confirm('کیا آپ یہ نتیجہ حذف کرنا چاہتے ہیں؟')) return;
  fetch('/api/results/' + id, {method:'DELETE'})
    .then(function(r){ return r.json(); })
    .then(function(d){ toast(d.message, d.success ? 'ok' : 'er'); if(d.success) loadResults(); })
    .catch(function(){ toast('حذف کرنے میں مسئلہ','er'); });
}

// ── Init ───────────────────────────────────────────────────────
loadStudents();
setToday();
</script>

</body>
</html>`;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());

// ── Root UI ───────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.type('html').send(HTML_PAGE);
});

app.use(express.static(path.join(__dirname, 'public')));

// ── Students ──────────────────────────────────────────────────────────────────

app.post('/api/students', (req, res) => {
  const { fullName, fatherName, dob, bForm, admissionClass, guardianPhone, address } = req.body;

  if (!fullName || !fatherName || !dob || !bForm || !admissionClass || !guardianPhone || !address) {
    return res.status(400).json({ success: false, message: 'تمام خانے پُر کریں' });
  }

  const students = readStudents();
  if (students.find(s => s.bForm === bForm)) {
    return res.status(409).json({ success: false, message: 'یہ بی فارم / شناختی کارڈ نمبر پہلے سے موجود ہے' });
  }

  const newStudent = {
    id: Date.now(),
    fullName, fatherName, dob, bForm, admissionClass, guardianPhone, address,
    admissionDate: new Date().toLocaleDateString('ur-PK')
  };

  students.push(newStudent);
  writeStudents(students);
  res.status(201).json({ success: true, message: 'داخلہ کامیابی سے مکمل ہو گیا', student: newStudent });
});

app.get('/api/students', (req, res) => {
  res.json({ success: true, students: readStudents() });
});

app.delete('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const students = readStudents();
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'طالبہ نہیں ملی' });
  students.splice(index, 1);
  writeStudents(students);
  res.json({ success: true, message: 'ریکارڈ حذف کر دیا گیا' });
});

// ── Fees ──────────────────────────────────────────────────────────────────────

app.get('/api/fees', (req, res) => {
  res.json({ success: true, fees: readFees() });
});

app.post('/api/fees', (req, res) => {
  const { studentId, amount, month, year } = req.body;
  if (!studentId || !amount || !month || !year) {
    return res.status(400).json({ success: false, message: 'تمام خانے پُر کریں' });
  }

  const students = readStudents();
  const student  = students.find(s => s.id === parseInt(studentId));
  if (!student) return res.status(404).json({ success: false, message: 'طالبہ نہیں ملی' });

  const fees     = readFees();
  const receiptNo = 'RCP-' + String(fees.length + 1).padStart(4, '0');

  const newFee = {
    id: Date.now(),
    studentId:      student.id,
    studentName:    student.fullName,
    fatherName:     student.fatherName,
    admissionClass: student.admissionClass,
    amount:         parseFloat(amount),
    month,
    year:           String(year),
    paymentDate:    new Date().toLocaleDateString('ur-PK'),
    receiptNo
  };

  fees.push(newFee);
  writeFees(fees);
  res.status(201).json({ success: true, message: 'فیس کامیابی سے محفوظ ہو گئی', fee: newFee });
});

app.delete('/api/fees/:id', (req, res) => {
  const id  = parseInt(req.params.id);
  const fees = readFees();
  const idx  = fees.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'ریکارڈ نہیں ملا' });
  fees.splice(idx, 1);
  writeFees(fees);
  res.json({ success: true, message: 'ریکارڈ حذف کر دیا گیا' });
});

// ── Attendance ────────────────────────────────────────────────────────────────

app.get('/api/attendance', (req, res) => {
  const all = readAttendance();
  const { date } = req.query;
  if (date) {
    return res.json({ success: true, record: all.find(a => a.date === date) || null });
  }
  res.json({ success: true, dates: all.map(a => a.date) });
});

app.post('/api/attendance', (req, res) => {
  const { date, records } = req.body;
  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ success: false, message: 'ڈیٹا نامکمل ہے' });
  }

  const all   = readAttendance();
  const entry = { date, records, savedAt: new Date().toLocaleDateString('ur-PK') };
  const idx   = all.findIndex(a => a.date === date);

  if (idx >= 0) all[idx] = entry;
  else          all.push(entry);

  all.sort((a, b) => (a.date < b.date ? 1 : -1));
  writeAttendance(all);
  res.json({ success: true, message: 'حاضری کامیابی سے محفوظ ہو گئی' });
});

// ── Results ───────────────────────────────────────────────────────────────────

app.get('/api/results', (req, res) => {
  res.json({ success: true, results: readResults() });
});

app.post('/api/results', (req, res) => {
  const { studentId, examTitle, quran, tajweed, urdu, dinyat, math } = req.body;

  if (!studentId || quran == null || tajweed == null || urdu == null || dinyat == null || math == null) {
    return res.status(400).json({ success: false, message: 'تمام خانے پُر کریں' });
  }

  const students = readStudents();
  const student  = students.find(s => s.id === parseInt(studentId));
  if (!student) return res.status(404).json({ success: false, message: 'طالبہ نہیں ملی' });

  const marks = {
    quran:   parseFloat(quran),
    tajweed: parseFloat(tajweed),
    urdu:    parseFloat(urdu),
    dinyat:  parseFloat(dinyat),
    math:    parseFloat(math)
  };

  const totalObtained = Object.values(marks).reduce((a, b) => a + b, 0);
  const totalMarks    = 500;
  const percentage    = (totalObtained / totalMarks) * 100;

  let grade, gradeLabel;
  if      (percentage >= 90) { grade = 'A+'; gradeLabel = 'ممتاز'; }
  else if (percentage >= 80) { grade = 'A';  gradeLabel = 'بہت اچھا'; }
  else if (percentage >= 70) { grade = 'B';  gradeLabel = 'اچھا'; }
  else if (percentage >= 60) { grade = 'C';  gradeLabel = 'اوسط'; }
  else if (percentage >= 50) { grade = 'D';  gradeLabel = 'کم'; }
  else                       { grade = 'F';  gradeLabel = 'ناکام'; }

  const results   = readResults();
  const newResult = {
    id:             Date.now(),
    studentId:      student.id,
    studentName:    student.fullName,
    fatherName:     student.fatherName,
    admissionClass: student.admissionClass,
    examTitle:      examTitle || 'سالانہ امتحان',
    marks,
    totalObtained,
    totalMarks,
    percentage:     Math.round(percentage * 100) / 100,
    grade,
    gradeLabel,
    examDate:       new Date().toLocaleDateString('ur-PK')
  };

  results.push(newResult);
  writeResults(results);
  res.status(201).json({ success: true, message: 'نتیجہ کامیابی سے محفوظ ہو گیا', result: newResult });
});

app.delete('/api/results/:id', (req, res) => {
  const id      = parseInt(req.params.id);
  const results = readResults();
  const idx     = results.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'ریکارڈ نہیں ملا' });
  results.splice(idx, 1);
  writeResults(results);
  res.json({ success: true, message: 'ریکارڈ حذف کر دیا گیا' });
});

// ── Backup ────────────────────────────────────────────────────────────────────

app.get('/api/backup', (req, res) => {
  try {
    const zip = new AdmZip();
    const files = ['students.json', 'fees.json', 'attendance.json', 'results.json'];
    let added = 0;

    files.forEach(file => {
      const fp = path.join(__dirname, file);
      if (fs.existsSync(fp)) { zip.addLocalFile(fp); added++; }
    });

    if (added === 0) return res.status(404).send('بیک اپ کے لیے کوئی ڈیٹا فائل نہیں ملی۔');

    const date = new Date().toISOString().slice(0, 10);
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=Madrasa_Aysha_Backup_' + date + '.zip');
    res.send(zip.toBuffer());
  } catch (err) {
    console.error('Backup Error:', err);
    res.status(500).send('بیک اپ بنانے میں سرور پر کوئی مسئلہ آیا ہے۔');
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
