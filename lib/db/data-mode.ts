export type DataMode = "demo" | "database";

export function getDataMode(): DataMode {
  return process.env.DATABASE_URL ? "database" : "demo";
}

export function isDatabaseMode() {
  return getDataMode() === "database";
}

export function dataModeLabel() {
  return isDatabaseMode() ? "وضع البيانات: قاعدة بيانات" : "وضع البيانات: تجريبي";
}
