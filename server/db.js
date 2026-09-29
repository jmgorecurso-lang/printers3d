import 'dotenv/config';
import { MongoClient } from 'mongodb';

const cliente = new MongoClient(process.env.MONGODB_URI);
let db;

export async function conectarDB() {
  if (!db) {
    await cliente.connect();
    db = cliente.db('printlab');
  }
  return db;
}
export async function cerrarDB() {
  await cliente.close();
  db = undefined;
}