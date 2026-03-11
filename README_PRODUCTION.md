## ISP Support Bot SaaS – Visión para CEO de ISP

Este proyecto está diseñado como un **SaaS de Marca Blanca (White Label)** para ISPs con ~50.000 abonados o más, con foco en:

- **Seguridad y aislamiento entre ISPs (multi-tenant real)**
- **Integración con sistemas existentes (billing y red)**
- **Auto-gestión Nivel 1 para reducir tickets al call center**

### 1. Seguridad y Multi-tenancy

- Cada ISP es un **tenant** separado en la base de datos:
  - Todas las tablas de negocio (`users`, `customers`, `customer_connections`, `invoices`, `audit_logs`, etc.) incluyen un campo obligatorio `tenant_id`.
  - Las consultas a BD se ejecutan siempre filtrando por `tenant_id`.
- El acceso al SaaS se realiza mediante una **API Key por ISP**:
  - La API key se guarda **en forma de hash** (`api_key_hash`) en la tabla `tenants`.
  - El middleware `tenantMiddleware`:
    - Lee `x-api-key` en la cabecera HTTP.
    - Resuelve qué ISP es, validando la key con hashing fuerte.
    - Adjunta el contexto del tenant al request para que el resto de la lógica sólo vea sus propios datos.
  - Resultado: **un ISP nunca puede acceder a datos de otro**, aunque intente cambiar IDs en las URLs.

### 2. Auditoría Completa de Acciones Técnicas

- El servicio `AuditLogger` registra **cada acción sensible**:
  - Quién la ejecutó (`actor_user_id` y tipo: usuario, sistema o bot).
  - Qué hizo (`action`, por ejemplo `ROUTER_REBOOT`, `HEALTH_CHECK`, `INVOICE_QUERY`).
  - Sobre qué recurso (`target_type` y `target_id`, por ejemplo un router o una conexión).
  - Cuándo (`created_at`) y con qué parámetros relevantes (`metadata` en formato JSON).
- La tabla `audit_logs` permite:
  - **Trazabilidad completa** ante auditorías internas o regulatorias.
  - Análisis posterior de uso (por ejemplo, cuántos reboots automáticos en una semana).

### 3. Auto-Gestión Nivel 1 para Clientes

El módulo de auto-gestión (`SelfCareService` + rutas `/api/self-care`) permite:

- **Consultar facturas pendientes**:
  - La interfaz `BillingProvider` abstrae proveedores como Wispro, Splynx o Mikrowisp.
  - Por tenant se configura qué proveedor se usa y con qué credenciales.
  - El bot puede mostrar al cliente facturas pendientes sin que el ISP duplique lógica.
- **Puntaje de salud de la conexión**:
  - La interfaz `NetworkProvider` define cómo medir:
    - Latencia, pérdida de paquetes, potencia de señal, etc.
  - Implementaciones específicas (MikroTik, OLT Huawei/ZTE) pueden conectarse vía API/SSH.
  - El resultado se expone como un **score 0–100**, fácil de entender para agentes y clientes.
- **Reboot remoto del router del cliente**:
  - A través del `NetworkProvider`, el sistema puede reiniciar el router o la ONT/puerto en la OLT.
  - Cada reboot queda **auditado** en `audit_logs`.

Estas capacidades permiten reducir llamadas al call center, resolviendo muchos casos de Nivel 1 de forma automática o semi-automática.

### 4. Integraciones por Proveedor (Provider Pattern)

- **Capa de abstracción `src/providers/`**:
  - `BillingProvider`: interfaz para billing (Wispro, Splynx, Mikrowisp).
  - `NetworkProvider`: interfaz para red (MikroTik, Huawei OLT, ZTE OLT).
  - `ProviderRegistry`: resuelve, por ISP (tenant), qué implementación usar y con qué credenciales.
- Beneficios para el ISP:
  - El core del bot **no se acopla a un único proveedor**.
  - Es posible cambiar de plataforma de billing o de vendor de red sin reescribir todo.

### 5. Marca Blanca (White Label)

- La tabla `tenant_branding` y el servicio `BrandingService` permiten que cada ISP defina:
  - Nombre del bot (`bot_name`).
  - Logo (`logo_url`).
  - Colores corporativos (`primary_color`, `secondary_color`).
- El frontend/widget puede leer esta configuración por tenant y adaptar:
  - Cabecera del chat.
  - Estilos (colores de botones, fondo, etc.).
  - Textos con el nombre comercial del ISP.

Resultado: **el mismo motor** sirve a múltiples ISPs, pero cada uno ve un bot 100% con su marca.

### 6. Escalabilidad y Operación

- Arquitectura basada en **Node.js + TypeScript + PostgreSQL**:
  - Fácil de desplegar en contenedores (Docker/Kubernetes).
  - PostgreSQL es estándar en el sector y soporta bien multi-tenant.
- Seguridad operativa:
  - Uso de middlewares de seguridad (`helmet`, `rate-limit`, CORS configurables).
  - Separación clara entre:
    - Capa de API pública.
    - Lógica de negocio (servicios).
    - Acceso a datos (migraciones SQL y pool de conexión).

### 7. Cómo se integra en el entorno del ISP

1. **Alta de tenant (ISP)**:
   - Se crea un registro en `tenants` con su `code`, `name` y `api_key_hash`.
   - Se define su configuración técnica en `tenant_config` (billing y red).
   - Se define opcionalmente su branding en `tenant_branding`.
2. **Integración con canales**:
   - El widget web del bot se integra en la página del ISP con una API key propia.
   - Se pueden conectar otros canales (app móvil, WhatsApp) usando la misma API.
3. **Operación diaria**:
   - El bot responde a clientes, consulta facturas, chequea salud de conexión y ejecuta reboots cuando procede.
   - Todas las acciones técnicas quedan registradas en `audit_logs`.

En conjunto, este diseño está pensado para pasar revisiones técnicas y de seguridad de un ISP mediano/grande, ofreciendo **aislamiento fuerte entre clientes, trazabilidad y extensibilidad** sin sacrificar la velocidad de despliegue.

