import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { MobileSnapshot, SnapshotStore, validateSnapshot } from './mobile-sync';

@Injectable({ providedIn: 'root' })
export class RecipeStore implements SnapshotStore {
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private database?: Promise<SQLiteDBConnection>;

  private open(): Promise<SQLiteDBConnection> {
    this.database ??= this.initialize();
    return this.database;
  }

  private async initialize(): Promise<SQLiteDBConnection> {
    const database = await this.sqlite.createConnection('kiosk_recipes', false, 'no-encryption', 1, false);
    await database.open();
    await database.execute('CREATE TABLE IF NOT EXISTS collection_snapshot (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL);');
    return database;
  }

  async read(): Promise<MobileSnapshot | null> {
    const database = await this.open();
    const result = await database.query('SELECT payload FROM collection_snapshot WHERE id = 1;');
    const rows = result.values as { payload: string }[] | undefined;
    return rows?.length ? validateSnapshot(JSON.parse(rows[0].payload)) : null;
  }

  async commit(input: MobileSnapshot): Promise<void> {
    const snapshot = validateSnapshot(input);
    const database = await this.open();
    await database.run('INSERT INTO collection_snapshot (id, payload) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload;', [JSON.stringify(snapshot)], true);
  }
}