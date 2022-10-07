import NodeEnvironment from "jest-environment-node";
import { Emulator } from "./emulator";

class FlowEnvironment extends NodeEnvironment {
  // MAYBE we will need this, it was using in older version,
  // but newer runtime doesn't have it
  /*
    setTimeout(timeout) {
        if (this.global.jasmine) {
            // eslint-disable-next-line no-underscore-dangle
            this.global.jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout
        } else {
            this.global[Symbol.for('TEST_TIMEOUT_SYMBOL')] = timeout
        }
    }
    */

  // Setup Phase
  async setup() {
    const emulator = new Emulator();
    this.global.emulator = emulator;
  }

  // Teardown Phase
  async teardown() {}
}

export default FlowEnvironment;
