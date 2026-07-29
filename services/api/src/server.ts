import { createServer } from "./app"

// Config
import { env } from './config/environment';

const server = createServer();
const PORT = env.PORT;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});