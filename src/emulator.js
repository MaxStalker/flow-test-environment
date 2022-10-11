import freePort from "portastic";
import { spawn } from "child_process";
import fetch from "node-fetch";
import portHandler from "./port-handler";

export class Emulator {
  constructor() {
    this.initialized = false;
    this.dock = [];
  }

  async waitForGreenLight() {
    if (this.initialized) {
      return true;
    }
    return new Promise((resolve, reject) => {
      let intervalId;
      // todo: enable via config
      const timeTag = `emulator on port ${this.port}`;
      console.time(timeTag);
      intervalId = setInterval(async () => {
        try {
          // We simply want to fetch a block from Flow Emulator here
          const url = `http://localhost:${this.port}/v1/blocks?height=final`;
          await fetch(url);
          resolve(true);
          clearInterval(intervalId);
          // todo: enable via config
          console.timeEnd(timeTag);
        } catch (e) {}
      }, 50);
    });
  }

  async start() {
    const dock = await portHandler.makeDock();
    const [grpc, admin, port] = dock;
    console.log({ grpc, admin, port });
    const restPort = "--rest-port=" + port;
    const adminServerPort = "--admin-port=" + admin;
    const grpcPort = "--port=" + grpc;
    const logFormat = "--log-format=JSON";
    const disableTxValidation = " --skip-tx-validation";

    this.process = spawn("flow", [
      "emulator",
      "--verbose",
      logFormat,
      grpcPort,
      adminServerPort,
      restPort,
      disableTxValidation,
    ]);

    this.port = port;
    this.dock = dock;

    // Add handlers

    /*    this.process.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    this.process.stderr.on("data", (data) => {
      console.error(data.toString());
    });*/

    await this.waitForGreenLight();
    this.initialized = true;
  }

  async stop() {
    return new Promise((resolve) => {
      portHandler.free(this.dock);
      this.process.kill();
      setTimeout(() => {
        this.initialized = false;
        resolve(true);
      }, 50);
    });
  }
}
