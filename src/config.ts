import type { ConfigFile } from "./types";
import fs from "fs";

export class Config {
  private static _instance: Config;

  static get Instance() {
    if (!this._instance) {
      this._instance = new Config("./config.json");
    }

    return this._instance;
  }

  public data!: ConfigFile;

  private constructor(private configFile: string) {
    fs.watchFile(this.configFile, () => this.load(true));
  }

  async load(update = false) {
    this.data = await Bun.file(this.configFile).json();
    console.log("config", update ? "updated" : "loaded");
  }
}
