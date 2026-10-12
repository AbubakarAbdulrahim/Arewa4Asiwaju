import "server-only";

type LogContext = Record<string, string | number | boolean | undefined>;

function write(level: "info" | "warn" | "error", event: string, context: LogContext = {}) {
  // Context is intentionally scalar and caller-selected; never pass request bodies or secrets.
  const record = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...context });
  if (level === "error") console.error(record);
  else if (level === "warn") console.warn(record);
  else console.info(record);
}

export const logger = {
  info: (event: string, context?: LogContext) => write("info", event, context),
  warn: (event: string, context?: LogContext) => write("warn", event, context),
  error: (event: string, context?: LogContext) => write("error", event, context),
};
