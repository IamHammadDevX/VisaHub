import { promises as fs } from "fs";
import path from "path";
import type { StoredApplication } from "@/types/application";

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "applications.json");

async function readApplications(): Promise<StoredApplication[]> {
  try {
    const content = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(content) as StoredApplication[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeApplications(applications: StoredApplication[]) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(applications, null, 2));
}

export function generateReferenceId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 8; i += 1) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VH-${id.slice(0, 4)}-${id.slice(4)}`;
}

export async function createApplication(
  input: Omit<StoredApplication, "createdAt" | "updatedAt" | "status">
) {
  const applications = await readApplications();
  const now = new Date().toISOString();
  const application: StoredApplication = {
    ...input,
    status: "payment_pending",
    createdAt: now,
    updatedAt: now,
  };

  applications.push(application);
  await writeApplications(applications);
  return application;
}

export async function getApplication(referenceId: string) {
  const applications = await readApplications();
  return (
    applications.find(
      (application) =>
        application.referenceId.toUpperCase() === referenceId.toUpperCase()
    ) ?? null
  );
}

export async function updateApplication(
  referenceId: string,
  patch: Partial<StoredApplication>
) {
  const applications = await readApplications();
  const index = applications.findIndex(
    (application) =>
      application.referenceId.toUpperCase() === referenceId.toUpperCase()
  );

  if (index === -1) return null;

  applications[index] = {
    ...applications[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await writeApplications(applications);
  return applications[index];
}
