# ISP Support Bot – White Label

Asistente de soporte técnico para proveedores de internet. **Instalación en 5 minutos.**  
IA con OpenAI (gpt-4o-mini) + flujo guiado + marca blanca.

---

## Por qué usarlo

- **White-label:** Tu nombre, tu logo, tus colores. Sin marca del producto.
- **Rápido:** Clasificación de intenciones automática (sin internet, lento, facturación, soporte).
- **Barato:** Coste real &lt; 0,50 €/mes. Precio de venta sugerido **39 €/mes** por bot.
- **Listo para producción:** Panel admin, flujos editables, despliegue en Railway / Render / Docker.

## Instalación (5 minutos)

1. Clona el repo y entra en la carpeta.
2. `npm install`
3. Copia `.env.example` a `.env` y añade tu [API key de OpenAI](https://platform.openai.com/api-keys).
4. `node server.js`

Listo. El bot responde en `/ai-chat` y `/chat`; el panel en `/flows` y `/update`.

## Beneficios para tu ISP

| Beneficio | Detalle |
|----------|--------|
| **Menos llamadas** | El bot resuelve dudas frecuentes y guía el troubleshooting. |
| **Marca propia** | Un solo bot, múltiples clientes; cada uno ve tu marca. |
| **Precio claro** | 39 €/mes por bot; licencia white-label incluida. |
| **Sin lock-in** | Código estándar (Node.js, OpenAI). Despliega donde quieras. |

## Endpoints

- **POST /ai-chat** — Respuesta con IA (OpenAI gpt-4o-mini).
- **POST /chat** — Árbol de decisiones (flujo configurable).
- **GET /flows** — Ver flujo actual (admin).
- **POST /update** — Editar mensajes del flujo (admin).
- **GET /test** — Health check.

---

Para visión enterprise (multi-tenant, auditoría, integraciones), ver **[VISION.md](VISION.md)**.
