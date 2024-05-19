import { Docker } from "./Docker";
import { Config } from "./config";
import { Proxy } from "./proxy";

await Config.Instance.load();

const proxies = new Map<string, Proxy>();

async function lookupContainers() {
  const containers = await Docker.Instance.getContainers();

  const projects = containers
    .map((container: any) => {
      const project = container.Labels["com.docker.compose.project"];
      const projectConfigs = Config.Instance.data["projects"][project];

      if (!projectConfigs) return;

      const name = container.Names[0].slice(1);
      const projectConfig = projectConfigs[name];

      if (!projectConfig) return;

      const port = container.Ports[0].PublicPort;

      return { project, name, port };
    })
    .filter((value) => value !== undefined) as Array<{
    project: string;
    name: string;
    port: number;
  }>;

  /// delete if container stopped
  for (const [key, proxy] of proxies.entries()) {
    const isRunning = projects.some(
      ({ project, name }) =>
        project === proxy.options.project && name === proxy.options.name,
    );

    if (
      !isRunning &&
      Date.now() - proxy.lastUpdate >
        (Config.Instance.data.options["proxy-timeout"] ?? 5_000)
    ) {
      proxy.stop();
      proxies.delete(key);
    }
  }

  for (const { project, name, port } of projects) {
    const key = `${project}-${name}`;
    let proxy = proxies.get(key);

    if (!proxy) {
      proxy = new Proxy({ project, name });
      proxies.set(key, proxy);
    }

    proxy.updatePort(port);
  }
}

lookupContainers();

setInterval(
  lookupContainers,
  Config.Instance.data["options"]["watch-interval"],
);
