import { spawn } from "child_process";
import freePort from "portastic";
import fetch from "node-fetch";

export class Emulator {
  constructor() {
    this.initialized = false;
    this.dock = [];
  }

  fixJSON(msg) {
    const parts = msg.split("\n").filter((item) => item !== "");
    const reconstructed = parts.length > 1 ? `[${parts.join(",")}]` : parts[0];
    return reconstructed;
  }

  parseDataBuffer(dataBuffer) {
    const data = dataBuffer.toString();
    console.log({ data });
    try {
      // if (data.includes("msg")) {
      const fixed = this.fixJSON(data);
      let messages = JSON.parse(fixed);

      // Make data into array if not array
      messages = [].concat(messages);

      // Map string levels to enum
      messages = messages.map((m) => ({
        ...m,
        level: "log",
      }));

      return messages;
      // }
    } catch (e) {
      console.error(e);
    }
    return [];
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
          // const url = `http://localhost:${this.port}/v1/blocks?height=final`;
          // await fetch(url);
          // todo: enable via config

          if (!this.initialized) {
            resolve(true);
            console.timeEnd(timeTag);
            clearInterval(intervalId);
          }
        } catch (e) {}
      }, 25);
    });
  }

  async start(processName) {
    // TODO: This is super hacky solution. Fix this with proper one 🙏
    const dock = await new Promise((resolve, reject) => {
      setTimeout(() => {
        freePort.find(
          {
            min: 8000,
            max: 10000,
          },
          (ports) => {
            if (ports.length < 3) {
              reject("Not enough ports");
            } else {
              resolve(ports.slice(0, 3));
            }
          }
        );
      });
    });
    const [grpc, admin, port] = dock;

    const restPort = "--rest-port=" + port;
    const adminServerPort = "--admin-port=" + admin;
    const grpcPort = "--port=" + grpc;
    const logFormat = "--log-format=JSON";
    const disableTxValidation = " --skip-tx-validation";

    console.log("Spawning process");
    // Try to find ./flow.json file and create it if it doesn't exist
    console.log("Running custom process!")
    this.process = spawn(processName, [
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

    this.process.stdout.on("data", (buffer) => {
      const logs = this.parseDataBuffer(buffer);
      console.log({ logs });
      const bindError = logs.find((log) => {
        return log.msg.includes("Failed to startup REST API");
      });
      if (bindError) {
        this.notStarted = true;
      }

      const started = logs.find((log) => {
        return log.msg.includes("Starting REST API");
      });
      if (started) {
        console.log("CACHING!");
        this.initialized = true;
      }
    });

    this.process.stderr.on("data", (data) => {
      console.error(data.toString());
    });

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
