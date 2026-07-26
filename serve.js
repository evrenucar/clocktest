// Minimal static server for the test suite. Exists so tests run against a real
// http:// origin -- localStorage behaves inconsistently under file://.
// Node stdlib only, no dependency.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

http.createServer((req, res) => {
    // Must keep the leading slash: './' + '/index.html' resolves correctly,
    // whereas './' + 'index.html' would look for a dotfile named .index.html.
    const rel = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(root, '.' + path.posix.normalize(rel));

    // Refuse anything that escapes the repo, even on a localhost-only server.
    if (!file.startsWith(root)) {
        res.writeHead(403);
        return res.end('forbidden');
    }

    fs.readFile(file, (err, buf) => {
        if (err) {
            res.writeHead(404);
            return res.end('not found');
        }
        res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
        res.end(buf);
    });
}).listen(process.env.PORT || 5173);
