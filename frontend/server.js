const express = require('express');
const next = require('next');
const cors = require('cors');
const path = require('path');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Enable CORS
  server.use(cors());
  
  // Serve static files from the public directory
  server.use(express.static(path.join(__dirname, 'public')));

  // Handle API routes
  server.all('/api/*', (req, res) => {
    return handle(req, res);
  });

  // Let Next.js handle all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
