const path = require('path');
const express = require('express');
const app = require('./api/index.js');

// Serve the static frontend from the project root so relative fetch('/api/...')
// calls in app.js work the same way locally as they do on Vercel.
app.use(express.static(path.join(__dirname)));

const PORT = process.env.LOCAL_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
