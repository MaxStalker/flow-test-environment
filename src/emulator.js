import freePort from "portastic";
import { spawn } from "child_process";
import fetch from "node-fetch";

export class Emulator {
  constructor() {
    this.initialized = false;
    this.port = null;
  }

  async findPort() {
    return new Promise((resolve, reject) => {
      // todo: use range from config
      freePort.find(
        {
          min: 8888,
          max: 9000,
        },
        (ports) => {
          if (ports.length > 0) {
            resolve(ports[0]);
          } else {
            reject("No ports available in range 8888 - 9000");
          }
        }
      );
    });
  }

  async waitForGreenLight() {
    return new Promise((resolve, reject) => {
      let intervalId;
      // todo: enable via config
      // console.time("emulator - startup");
      intervalId = setInterval(async () => {
        try {
          // We simply want to fetch a block from Flow Emulator here
          const url = `http://localhost:${this.port}/v1/blocks?height=final`;
          await fetch(url);
          resolve(true);
          clearInterval(intervalId);
          // todo: enable via config
          // console.timeEnd("emulator - startup");
        } catch (e) {}
      }, 50);
    });
  }

  async start() {
    this.port = await this.findPort();
    console.log(this.port);
    const restPort = "--rest-port=" + this.port;
    const logFormat = "--log-format=JSON";
    const disableTxValidation = " --skip-tx-validation";

    this.process = spawn("flow", [
      "emulator",
      "--verbose",
      logFormat,
      restPort,
      disableTxValidation,
    ]);

    await this.waitForGreenLight();
    this.initialized = true;
  }

  async stop() {
    return new Promise((resolve) => {
      this.process.kill();
      setTimeout(() => {
        this.initialized = false;
        resolve(true);
      }, 50);
    });
  }
}
