import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // En producción se debe configurar siempre DATABASE_URL.
  // Para desarrollo local, puedes usar PostgreSQL en docker.
  console.warn("[DB] DATABASE_URL no está definido. Configúralo antes de producción.");
}

export const dbPool = new Pool({
  connectionString,
});

