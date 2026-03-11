import { NetworkProvider, ConnectionHealth } from "./NetworkProvider";

export class HuaweiOltNetworkProvider implements NetworkProvider {
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
      details: "Stub Huawei OLT health check (sin integrar aún)",
    };
  }

  async rebootRouter(params: {
    tenantCode: string;
    connectionId: string;
    routerIp?: string | undefined;
  }): Promise<void> {
    void params;
    // Aquí irían los comandos para reset de ONT/puerto.
  }
}

