# ISP Support Bot – White Label

Asistente IA para soporte técnico de proveedores de internet.  
Clasificación automática de intenciones + árbol de decisiones + fallback seguro.

## Características
- Detección de intención con xAI Grok (grok-4-1-fast)
- Flujo de troubleshooting para ISP (no internet, lento, facturación, soporte humano)
- Panel admin simple (/flows y /update)
- Totalmente white-label (cambia nombre y logo por cliente)
- Despliegue en 1 clic (Railway / Render / Docker)

## Instalación (5 minutos)

1. Clona este repositorio
2. `npm install`
3. Copia `.env.example` → `.env` y pega tu clave de https://console.x.ai
4. `node server.js`

## Endpoints principales
- POST /ai-chat → IA + respuesta inteligente
- POST /chat → árbol de decisiones clásico
- GET /flows → panel admin
- GET /test → health check

## Precios recomendados para revender
- 39 €/mes por bot (coste real para ti: < 0,50 €/mes)
- Licencia white-label incluida

## Soporte
Este bot está listo para producción. Si necesitas personalización (logo, colores, más intents), contáctame.

Desarrollado con ❤️ para ISP españoles y latinoamericanos.

## Capturas de Pantalla

![Servidor corriendo](screenshots/terminal.png)
![Prueba IA en Thunder Client](screenshots/thunder.png)
![Health Check](screenshots/localhost.png)
![Panel Admin](screenshots/flow.png)
![Flujo no internet](screenshots/flow2.png)

**El bot funcionando en menos de 5 minutos.**
