import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Set project name before importing port-client
process.env.PROJECT_NAME = 'hq-database-apis';

const { port } = await import('port-registry/port-client');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const allocatedPort = await port;

await app.prepare();

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
});

server.listen(allocatedPort, () => {
  console.log(`> Ready on http://localhost:${allocatedPort}`);
});
