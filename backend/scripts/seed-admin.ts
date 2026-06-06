import dotenv from 'dotenv';
import { seedAdmin } from '../src/bootstrap/seed-admin.js';

dotenv.config();

seedAdmin().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
