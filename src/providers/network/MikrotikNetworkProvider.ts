import { NetworkProvider, ConnectionHealth } from "./NetworkProvider";

export class MikrotikNetworkProvider implements NetworkProvider {
  constructor(private readonly host: string, private readonly username: string, private readonly password: string) {}

  async getConnectionHealth(params: {
    tenantCode: string;
    connectionId: string;
    routerIp?: string | undefined;
  }): Promise<ConnectionHealth> {
    void params;
    return {
      latencyMs: null,
      packetLossPercent: null,
      signalStrengthDbm: null,
      score: 50,
      details: "Stub Mikrotik health check (sin integrar aún)",
    };
  }

  async rebootRouter(params: {
    tenantCode: string;
    connectionId: string;
    routerIp?: string | undefined;
  }): Promise<void> {
    void params;
    // Aquí iría la llamada real a la API/SSH de MikroTik.
  }
}

