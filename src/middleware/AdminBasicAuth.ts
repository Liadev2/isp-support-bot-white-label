import { Request, Response, NextFunction } from "express";

export function adminBasicAuth(req: Request, res: Response, next: NextFunction) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    console.error("[AdminBasicAuth] ADMIN_USER o ADMIN_PASS no configurados");
    return res.status(500).json({ error: "Autenticación de administrador no configurada" });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Dashboard"');
    return res.status(401).json({ error: "Credenciales requeridas" });
  }

  const base64 = header.slice("Basic ".length).trim();
  let decoded: string;
  try {
    decoded = Buffer.from(base64, "base64").toString("utf8");
  } catch {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Dashboard"');
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const [providedUser, providedPass] = decoded.split(":", 2);
  if (providedUser !== user || providedPass !== pass) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Dashboard"');
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  return next();
}

