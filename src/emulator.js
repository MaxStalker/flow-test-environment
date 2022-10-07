import portastic from "portastic";
const { spawn } = require("child_process");
import fetch from "node-fetch";

export class Emulator {
  constructor() {
    this.initialized = false;
    this.port = null;
  }

  async findPort() {
    return new Promise((resolve, reject) => {
      // todo: use range from config
      portastic.find(
        {
          min: 8888,
          max: 9000,
        },
        (err, port) => {
          if (!err) {
            console.log("Found empty port:", port);
            resolve(port);
          } else {
            reject(err);
          }
        }
      );
    });
  }

  async waitForGreenLight() {
    return new Promise((resolve, reject) => {
      let intervalId;
      intervalId = setInterval(async () => {
        try {
          console.log("Emulator is up!");
          const block = await fetch(
            `http://localhost:${this.port}/v1/blocks?height=final`
          );
          console.log("got block", block);
          resolve(true);
          clearInterval(intervalId);
        } catch (e) {
          console.log("Still down...");
        }
      }, 50);
    });
  }

  async start() {
    this.port = await this.findPort();
    const restPort = "--rest-port=" + this.port;
    const logFormat = "--log-format=JSON";

    this.process = spawn("flow", [
      "emulator",
      "--verbose",
      logFormat,
      restPort,
    ]);
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
