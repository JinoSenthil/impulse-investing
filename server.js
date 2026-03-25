// server.js - Optimized for Hostinger
const { createServer } = require('http');
const next = require('next');
const url = require('url');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ 
  dev,
  dir: __dirname,  // Important for Hostinger
  quiet: false
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      // Parse URL
      const parsedUrl = url.parse(req.url, true);
      const { pathname, query } = parsedUrl;
      
      // Handle Next.js routes
      handle(req, res, parsedUrl);
      
    } catch (error) {
      console.error('Error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Next.js ready on port ${port}`);
    console.log(`> Mode: ${dev ? 'development' : 'production'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
