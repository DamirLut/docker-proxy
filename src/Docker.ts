import type { Container } from "./types";

export class Docker {
  private static _instance: Docker;

  static get Instance() {
    if (!this._instance) {
      this._instance = new Docker();
    }

    return this._instance;
  }

  getContainers() {
    return this.request<Container[]>("/containers/json");
  }

  request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(path, "http://localhost/");

    Object.assign(options, { unix: "/var/run/docker.sock" });

    return fetch(url, options).then((res) => res.json());
  }
}
