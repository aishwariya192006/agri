import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'users.json');

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function findUserByEmail(email) {
  return readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser({ name, email, phone, passwordHash }) {
  const users = readUsers();
  const user = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    passwordHash,
    farm: { state: 'Punjab', area: 12, crops: ['Wheat', 'Cotton'] },
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
