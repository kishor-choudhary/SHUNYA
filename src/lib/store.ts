import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { hashPassword } from "./auth";
import { DEFAULT_THEME, isThemeId } from "./themes";
import { makeId, seedDatabase, slugify } from "./seed";
import type {
  Enquiry,
  GalleryItem,
  ShunyaDatabase,
  ShunyaEvent,
  SiteSettings,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Storage                                                                   */
/* -------------------------------------------------------------------------- */
/**
 * Content is persisted as a single JSON document.
 *
 * Why a file: the site must be able to run and be handed over with zero
 * external services, while still giving the brand a real admin interface for
 * events and galleries. `DATA_DIR` lets a deploy point at a mounted volume; on
 * hosts with a read-only filesystem, reads fall back to the seed content so the
 * public site never breaks.
 */
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "shunya.json");

declare global {
  // eslint-disable-next-line no-var
  var __shunyaDbCache: { mtimeMs: number; db: ShunyaDatabase } | undefined;
}

function defaultDatabase(): ShunyaDatabase {
  const db = seedDatabase();
  // Real hash so the documented demo password actually verifies.
  db.admin = {
    username: "shunya-admin",
    passwordHash: hashPassword("shunya-demo"),
    mustChangePassword: true,
    updatedAt: new Date().toISOString(),
  };
  return db;
}

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(defaultDatabase(), null, 2), "utf8");
  }
}

export async function readDatabase(): Promise<ShunyaDatabase> {
  try {
    await ensureFile();
    const stat = await fs.stat(DB_FILE);
    const cached = globalThis.__shunyaDbCache;
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.db;

    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as ShunyaDatabase;
    const db = normalizeDatabase(parsed);
    globalThis.__shunyaDbCache = { mtimeMs: stat.mtimeMs, db };
    return db;
  } catch (error) {
    console.error("[shunya] falling back to seed content:", error);
    return defaultDatabase();
  }
}

export async function writeDatabase(db: ShunyaDatabase): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const payload = JSON.stringify(db, null, 2);
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, DB_FILE); // atomic swap — no half-written content
  const stat = await fs.stat(DB_FILE);
  globalThis.__shunyaDbCache = { mtimeMs: stat.mtimeMs, db };
}

/** Fill in anything a previous version of the document might be missing. */
function normalizeDatabase(db: ShunyaDatabase): ShunyaDatabase {
  const seed = defaultDatabase();
  const settings = { ...seed.settings, ...(db.settings ?? {}) };
  // A document written before themes existed has no theme field, and a stored
  // id can outlive the registry. Either way, fall back to the default look
  // rather than rendering <html data-theme="undefined">.
  if (!isThemeId(settings.theme)) settings.theme = DEFAULT_THEME;

  return {
    version: db.version ?? 1,
    settings,
    events: Array.isArray(db.events) ? db.events : seed.events,
    gallery: Array.isArray(db.gallery) ? db.gallery : seed.gallery,
    enquiries: Array.isArray(db.enquiries) ? db.enquiries : [],
    admin: db.admin?.passwordHash ? db.admin : seed.admin,
  };
}

/* -------------------------------------------------------------------------- */
/*  Reads                                                                     */
/* -------------------------------------------------------------------------- */

export async function getSettings(): Promise<SiteSettings> {
  return (await readDatabase()).settings;
}

export async function getEvents(options?: { includeDrafts?: boolean }): Promise<ShunyaEvent[]> {
  const { events } = await readDatabase();
  const visible = options?.includeDrafts ? events : events.filter((e) => e.status === "published");
  return [...visible].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
}

export async function getEventBySlug(slug: string): Promise<ShunyaEvent | null> {
  const { events } = await readDatabase();
  return events.find((e) => e.slug === slug) ?? null;
}

export async function getEventById(id: string): Promise<ShunyaEvent | null> {
  const { events } = await readDatabase();
  return events.find((e) => e.id === id) ?? null;
}

export async function getGallery(options?: { includeHidden?: boolean }): Promise<GalleryItem[]> {
  const { gallery } = await readDatabase();
  const visible = options?.includeHidden ? gallery : gallery.filter((g) => g.published);
  return [...visible].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const { enquiries } = await readDatabase();
  return [...enquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* -------------------------------------------------------------------------- */
/*  Writes — events                                                           */
/* -------------------------------------------------------------------------- */

function uniqueSlug(events: ShunyaEvent[], desired: string, ignoreId?: string): string {
  const base = slugify(desired) || `event-${Date.now().toString(36)}`;
  let candidate = base;
  let n = 2;
  while (events.some((e) => e.slug === candidate && e.id !== ignoreId)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

export type EventInput = Omit<ShunyaEvent, "id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string;
};

export async function createEvent(input: EventInput): Promise<ShunyaEvent> {
  const db = await readDatabase();
  const now = new Date().toISOString();
  const event: ShunyaEvent = {
    ...input,
    id: makeId("evt"),
    slug: uniqueSlug(db.events, input.slug || input.title),
    createdAt: now,
    updatedAt: now,
  };
  db.events.push(event);
  db.events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  await writeDatabase(db);
  return event;
}

export async function updateEvent(id: string, patch: Partial<EventInput>): Promise<ShunyaEvent | null> {
  const db = await readDatabase();
  const index = db.events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const current = db.events[index];
  const next: ShunyaEvent = {
    ...current,
    ...patch,
    slug: patch.slug ? uniqueSlug(db.events, patch.slug, id) : current.slug,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  db.events[index] = next;
  db.events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  await writeDatabase(db);
  return next;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const db = await readDatabase();
  const before = db.events.length;
  db.events = db.events.filter((e) => e.id !== id);
  if (db.events.length === before) return false;
  await writeDatabase(db);
  return true;
}

/* -------------------------------------------------------------------------- */
/*  Writes — gallery                                                          */
/* -------------------------------------------------------------------------- */

export async function createGalleryItem(
  input: Omit<GalleryItem, "id" | "createdAt">,
): Promise<GalleryItem> {
  const db = await readDatabase();
  const item: GalleryItem = { ...input, id: makeId("img"), createdAt: new Date().toISOString() };
  db.gallery.push(item);
  await writeDatabase(db);
  return item;
}

export async function updateGalleryItem(
  id: string,
  patch: Partial<Omit<GalleryItem, "id" | "createdAt">>,
): Promise<GalleryItem | null> {
  const db = await readDatabase();
  const index = db.gallery.findIndex((g) => g.id === id);
  if (index === -1) return null;
  db.gallery[index] = { ...db.gallery[index], ...patch, id };
  await writeDatabase(db);
  return db.gallery[index];
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const db = await readDatabase();
  const before = db.gallery.length;
  db.gallery = db.gallery.filter((g) => g.id !== id);
  if (db.gallery.length === before) return false;
  await writeDatabase(db);
  return true;
}

/* -------------------------------------------------------------------------- */
/*  Writes — enquiries                                                        */
/* -------------------------------------------------------------------------- */

export async function createEnquiry(
  input: Omit<Enquiry, "id" | "createdAt" | "status">,
): Promise<Enquiry> {
  const db = await readDatabase();
  const enquiry: Enquiry = {
    ...input,
    id: makeId("enq"),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  db.enquiries.unshift(enquiry);
  // Keep the document bounded; the admin inbox is not a CRM.
  db.enquiries = db.enquiries.slice(0, 2000);
  await writeDatabase(db);
  return enquiry;
}

export async function updateEnquiryStatus(
  id: string,
  status: Enquiry["status"],
): Promise<Enquiry | null> {
  const db = await readDatabase();
  const index = db.enquiries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  db.enquiries[index] = { ...db.enquiries[index], status };
  await writeDatabase(db);
  return db.enquiries[index];
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const db = await readDatabase();
  const before = db.enquiries.length;
  db.enquiries = db.enquiries.filter((e) => e.id !== id);
  if (db.enquiries.length === before) return false;
  await writeDatabase(db);
  return true;
}

/* -------------------------------------------------------------------------- */
/*  Writes — settings & admin                                                 */
/* -------------------------------------------------------------------------- */

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = await readDatabase();
  db.settings = { ...db.settings, ...patch, updatedAt: new Date().toISOString() };
  await writeDatabase(db);
  return db.settings;
}

export async function getAdminAccount() {
  return (await readDatabase()).admin;
}

export async function updateAdminAccount(patch: {
  username?: string;
  passwordHash?: string;
  mustChangePassword?: boolean;
}) {
  const db = await readDatabase();
  db.admin = { ...db.admin, ...patch, updatedAt: new Date().toISOString() };
  await writeDatabase(db);
  return db.admin;
}

/* -------------------------------------------------------------------------- */
/*  Uploads                                                                   */
/* -------------------------------------------------------------------------- */
/**
 * Base64 data-URL uploads land in a writable directory. On a read-only host,
 * `DATA_DIR` should be a mounted volume; otherwise the studio should be given
 * image URLs from an external CDN instead.
 */
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUpload(fileName: string, data: Buffer): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const safe = `${Date.now().toString(36)}-${slugify(fileName.replace(/\.[^.]+$/, ""))}`;
  const ext = (fileName.match(/\.[^.]+$/)?.[0] ?? ".jpg").toLowerCase();
  const finalName = `${safe}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, finalName), data);
  return `/uploads/${finalName}`;
}
