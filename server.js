const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the frontend/out directory
app.use(express.static(path.join(__dirname, 'frontend/out')));

// For all other routes, send the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/out/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
