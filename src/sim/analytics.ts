import type { EventRecord } from './types';

interface DuckDbConnection {
  query(sql: string): Promise<{
    schema: { fields: Array<{ name: string }> };
    toArray(): Array<Record<string, unknown>>;
  }>;
  close(): Promise<void>;
}

interface DuckDbInstance {
  connect(): Promise<DuckDbConnection>;
  registerFileText(name: string, text: string): Promise<void>;
}

let dbPromise: Promise<DuckDbInstance | null> | null = null;
let registeredLength = -1;

/** DuckDB-WASM is loaded only when the Analyst Console is first used. */
function getDb(): Promise<DuckDbInstance | null> {
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const duckdb = await import('@duckdb/duckdb-wasm');
        const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
        if (!bundle.mainWorker) throw new Error('No DuckDB worker bundle');
        const worker = new Worker(bundle.mainWorker);
        const logger = new duckdb.ConsoleLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        return db as unknown as DuckDbInstance;
      } catch (error) {
        console.warn('DuckDB-WASM unavailable; using in-memory fallback.', error);
        return null;
      }
    })();
  }
  return dbPromise;
}

async function registerEvents(events: EventRecord[]): Promise<DuckDbInstance | null> {
  const db = await getDb();
  if (!db || events.length === registeredLength) return db;
  registeredLength = events.length;
  await db.registerFileText('events.json', JSON.stringify(events));
  const connection = await db.connect();
  await connection.query(
    "CREATE OR REPLACE TABLE events AS SELECT * FROM read_json_auto('events.json')",
  );
  await connection.close();
  return db;
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  fallback: boolean;
}

export async function queryEvents(sql: string, events: EventRecord[]): Promise<QueryResult> {
  const db = await registerEvents(events);
  if (db) {
    try {
      const connection = await db.connect();
      const result = await connection.query(sql);
      const columns = result.schema.fields.map((field) => field.name);
      const rows = result.toArray().map((row) => columns.map((column) => row[column]));
      await connection.close();
      return { columns, rows, fallback: false };
    } catch (error) {
      return { columns: ['error'], rows: [[String(error)]], fallback: true };
    }
  }

  const columns = ['id', 'tick', 'type', 'payload', 'causeIds'];
  const rows = events
    .slice(-20)
    .map((event) => [
      event.id,
      event.tick,
      event.type,
      JSON.stringify(event.payload),
      JSON.stringify(event.causeIds),
    ]);
  return { columns, rows, fallback: true };
}
