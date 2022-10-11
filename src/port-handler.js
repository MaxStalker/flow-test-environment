import freePort from "portastic";

export class PortHandler {
  constructor(startRange = 8080, endRange = 9200) {
    this.startRange = startRange;
    this.endRange = endRange;
    this.busy = {};
    this.queue = [];
  }

  async makeDock() {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    // get first in line
    const current = this.queue.shift();
    if (current) {
      const { resolve, reject } = current;
      freePort.find(
        {
          min: this.startRange,
          max: this.endRange,
        },
        (ports) => {
          let found = ports
            .filter((port) => {
              return !this.busy[port];
            })
            .slice(0, 3);

          if (found.length === 3) {
            for (const port of found) {
              this.busy[port] = true;
            }
            resolve(found);
          } else {
            reject("Not enough free ports");
          }
        }
      );
      this.processQueue();
    }
  }

  free(dock){
    for (const port of dock) {
      this.busy[port] = null;
    }
  }
}

const portHandler = new PortHandler();
export default portHandler;
