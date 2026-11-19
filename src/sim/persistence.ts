import { openDB, type IDBPDatabase } from 'idb';
import type { Command, GameState } from './types';

const DB_NAME = 'kanairo-ledger';
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('snapshots')) database.createObjectStore('snapshots');
        if (!database.objectStoreNames.contains('commands')) {
          database.createObjectStore('commands', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveSnapshot(state: GameState): Promise<void> {
  const database = await getDb();
  await database.put('snapshots', state, 'latest');
}

export async function loadSnapshot(): Promise<GameState | undefined> {
  const database = await getDb();
  return database.get('snapshots', 'latest');
}

export async function appendCommand(command: Command, tick: number): Promise<void> {
  const database = await getDb();
  await database.add('commands', { command, tick });
}

export async function loadCommands(): Promise<Array<{ command: Command; tick: number }>> {
  const database = await getDb();
  return database.getAll('commands');
}

export async function clearSave(): Promise<void> {
  const database = await getDb();
  await database.clear('snapshots');
  await database.clear('commands');
}
