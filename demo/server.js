const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from demo directory
app.use(express.static(__dirname));

// Serve source files from parent src directory
app.use('/src', express.static(path.join(__dirname, '../src')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test with referral: http://localhost:${PORT}?rfsn=123456.abcdef`);
});