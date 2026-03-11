export interface ConnectionHealth {
  latencyMs: number | null;
  packetLossPercent: number | null;
  signalStrengthDbm: number | null;
  score: number; // 0-100
  details: string;
}

export interface NetworkProvider {
  /**
   * Calcula un puntaje de salud de la conexión a partir de métricas técnicas.
   */
  getConnectionHealth(params: {
    tenantCode: string;
    connectionId: string;
    routerIp?: string;
  }): Promise<ConnectionHealth>;

  /**
   * Envía un comando de reboot al router del cliente.
   */
  rebootRouter(params: {
    tenantCode: string;
    connectionId: string;
    routerIp?: string;
  }): Promise<void>;
}

