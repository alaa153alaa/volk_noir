const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// index: false عشان مايفتحش index.html تلقائي على "/"
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// أول ما حد يفتح الرابط الرئيسي، يوجّهه لصفحة تسجيل الدخول
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('خطأ في السيرفر');
    }

    const users = JSON.parse(data);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      res.send('تم تسجيل الدخول بنجاح');
    } else {
      res.status(401).send('بيانات الدخول غير صحيحة');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});