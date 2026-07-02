import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(__dirname, '../../../../data');

export function loadDomainData<T>(domainName: string): T | null {
  const filePath = path.join(DATA_DIR, `${domainName}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getItems(data: any, key: string): any[] {
  const val = data?.[key];
  if (Array.isArray(val)) return val;
  if (val?.items && Array.isArray(val.items)) return val.items;
  return [];
}

export function findItem(data: any, key: string, id: string, idField: string = 'id'): any | undefined {
  return getItems(data, key).find((item: any) => item[idField] === id);
}

export function uuid(): string {
  return crypto.randomUUID();
}

export function ok<T>(data: T) {
  return { status: 200, body: data };
}

export function created<T>(data: T) {
  return { status: 201, body: data };
}

export function noContent() {
  return { status: 204, body: undefined };
}
