import { SishClient } from "sish-client";
import { Config } from "./config";
import { Colors } from "./colors";

const log = (...values: any[]) =>
  console.log(`[${Colors.FgGreen}Proxy${Colors.Reset}]`, ...values);

export class Proxy {
  private client!: SishClient;
  private currentPort!: number;

  private static id = 0;
  private id = ++Proxy.id;

  private isConnecting = false;
  private isClosed = false;

  lastUpdate = Date.now();

  constructor(readonly options: { project: string; name: string }) {
    this.log("Start");
  }

  async updatePort(port: number, force = false) {
    this.lastUpdate = Date.now();
    if (!force && port === this.currentPort) return;
    if (this.isConnecting) return;

    if (this.client) {
      /// kill previous client
      this.client.disconnect();
      this.log("Updating");
      await Bun.sleep(1_000);
    }

    this.isConnecting = true;

    this.client = new SishClient({
      local_port: port,
      local_host: "localhost",
      remote_port: 80,
      sish_host: Config.Instance.data.options["sish-host"],
      subdomain: this.options.name,
    });

    this.client.on("ready", (type, tunnel) => {
      this.log("Ready", tunnel);
      this.isConnecting = false;
      this.isClosed = false;
    });

    this.client.on("close", async (code) => {
      if (this.isClosed) return;
      this.log("Closed", code);
      if (code === 0) return;
      await Bun.sleep(1_000);
      this.updatePort(port, true);
    });

    this.currentPort = port;
  }

  stop() {
    if (this.client) {
      this.client.disconnect();
      this.log("Stop");
      this.isClosed = true;
    }
  }

  private log(...values: any[]) {
    log(`[${this.options.project}/${this.options.name}#${this.id}]`, ...values);
  }
}
