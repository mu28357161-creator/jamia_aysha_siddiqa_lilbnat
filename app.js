const AdmZip = require('adm-zip');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE       = path.join(__dirname, 'students.json');
const FEES_FILE       = path.join(__dirname, 'fees.json');
const ATTENDANCE_FILE = path.join(__dirname, 'attendance.json');
const RESULTS_FILE    = path.join(__dirname, 'results.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readStudents() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2), 'utf8');
}

function readFees() {
  try {
    const data = fs.readFileSync(FEES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeFees(fees) {
  fs.writeFileSync(FEES_FILE, JSON.stringify(fees, null, 2), 'utf8');
}

function readAttendance() {
  try {
    return JSON.parse(fs.readFileSync(ATTENDANCE_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeAttendance(data) {
  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function readResults() {
  try {
    return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeResults(data) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Submit new student admission
app.post('/api/students', (req, res) => {
  const { fullName, fatherName, dob, bForm, admissionClass, guardianPhone, address } = req.body;

  if (!fullName || !fatherName || !dob || !bForm || !admissionClass || !guardianPhone || !address) {
    return res.status(400).json({ success: false, message: 'تمام خانے پُر کریں' });
  }

  const students = readStudents();

  const duplicate = students.find(s => s.bForm === bForm);
  if (duplicate) {
    return res.status(409).json({ success: false, message: 'یہ بی فارم / شناختی کارڈ نمبر پہلے سے موجود ہے' });
  }

  const newStudent = {
    id: Date.now(),
    fullName,
    fatherName,
    dob,
    bForm,
    admissionClass,
    guardianPhone,
    address,
    admissionDate: new Date().toLocaleDateString('ur-PK')
  };

  students.push(newStudent);
  writeStudents(students);

  res.status(201).json({ success: true, message: 'داخلہ کامیابی سے مکمل ہو گیا', student: newStudent });
});

// Get all students
app.get('/api/students', (req, res) => {
  const students = readStudents();
  res.json({ success: true, students });
});

// Delete a student by id
app.delete('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let students = readStudents();
  const index = students.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'طالبہ نہیں ملی' });
  }
  students.splice(index, 1);
  writeStudents(students);
  res.json({ success: true, message: 'ریکارڈ حذف کر دیا گیا' });
});

// ── Fee Routes ──

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
  if (!student) {
    return res.status(404).json({ success: false, message: 'طالبہ نہیں ملی' });
  }

  const fees      = readFees();
  const receiptNo = 'RCP-' + String(fees.length + 1).padStart(4, '0');

  const newFee = {
    id:             Date.now(),
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
  let fees  = readFees();
  const idx = fees.findIndex(f => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'ریکارڈ نہیں ملا' });
  }
  fees.splice(idx, 1);
  writeFees(fees);
  res.json({ success: true, message: 'ریکارڈ حذف کر دیا گیا' });
});

// ── Attendance Routes ──

// GET ?date=YYYY-MM-DD → single day record; no query → list of all saved dates
app.get('/api/attendance', (req, res) => {
  const all = readAttendance();
  const { date } = req.query;
  if (date) {
    const record = all.find(a => a.date === date) || null;
    return res.json({ success: true, record });
  }
  res.json({ success: true, dates: all.map(a => a.date) });
});

// POST { date, records:[{studentId,studentName,fatherName,admissionClass,status}] }
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

  // Keep sorted newest-first
  all.sort((a, b) => (a.date < b.date ? 1 : -1));
  writeAttendance(all);
  res.json({ success: true, message: 'حاضری کامیابی سے محفوظ ہو گئی' });
});

// ── Results Routes ──

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
  if (!student) {
    return res.status(404).json({ success: false, message: 'طالبہ نہیں ملی' });
  }

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
  let results   = readResults();
  const idx     = results.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'ریکارڈ نہیں ملا' });
  }
  results.splice(idx, 1);
  writeResults(results);
  res.json({ success: true, message: 'ریکارڈ حذف کر دیا گیا' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} — visit http://localhost:${PORT}`);
});
// --- ڈیٹا بیک اپ سسٹم کا کوڈ شروع ---

app.get('/api/backup', (req, res) => {
    try {
        const zip = new AdmZip();
        
        // ان تمام فائلوں کی لسٹ جن کا بیک اپ لینا ہے
        const filesToBackup = [
            'students.json', 
            'fees.json', 
            'attendance.json', 
            'results.json'
        ];

        let filesAdded = 0;

        filesToBackup.forEach(file => {
            const filePath = path.join(__dirname, file);
            
            // چیک کریں کہ فائل موجود ہے یا نہیں
            if (fs.existsSync(filePath)) {
                zip.addLocalFile(filePath);
                filesAdded++;
            }
        });

        if (filesAdded === 0) {
            return res.status(404).send("بیک اپ کے لیے کوئی ڈیٹا فائل نہیں ملی۔");
        }

        // زپ فائل کا نام موجودہ تاریخ کے ساتھ
        const date = new Date().toISOString().slice(0, 10);
        const downloadName = `Madrasa_Aysha_Backup_${date}.zip`;
        
        const zipBuffer = zip.toBuffer();

        // فائل ڈاؤن لوڈ کروانے کی سیٹنگز
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=${downloadName}`);
        res.send(zipBuffer);

    } catch (error) {
        console.error("Backup Error:", error);
        res.status(500).send("بیک اپ بنانے میں سرور پر کوئی مسئلہ آیا ہے۔");
    }
});
// --- ڈیٹا بیک اپ سسٹم کا کوڈ ختم ---