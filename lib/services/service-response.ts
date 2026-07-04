import { getDataMode } from "@/lib/db/data-mode";

export type ServiceResponse<T> = {
  ok: boolean;
  data: T;
  mode: "demo" | "database";
  message?: string;
};

export function serviceOk<T>(data: T): ServiceResponse<T> {
  return {
    ok: true,
    data,
    mode: getDataMode()
  };
}

export function serviceFallback<T>(data: T): ServiceResponse<T> {
  return {
    ok: true,
    data,
    mode: "demo",
    message: "وضع البيانات التجريبي مفعل"
  };
}

export function serviceError<T>(data: T): ServiceResponse<T> {
  return {
    ok: false,
    data,
    mode: getDataMode(),
    message: "تعذر تحميل البيانات مؤقتا"
  };
}
