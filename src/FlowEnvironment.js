import NodeEnvironment from "jest-environment-node";
import { Emulator } from "./emulator";
import portHandler from "./port-handler";

class FlowEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    // console.log(config.globalConfig);
    // console.log(config.projectConfig);

    this.testPath = context.testPath;
    this.docblockPragmas = context.docblockPragmas;
  }

  // Setup Phase
  async setup() {
    await super.setup();

    console.log("FENV - START");
    // TODO: Read this value from config - how much time we wait before fetching free ports
    const emulator = new Emulator();
    await emulator.start();
    console.log("FENV - Emulator Started");
    this.global.emulator = emulator;
  }

  // Teardown Phase
  async teardown() {
    await this.global.emulator.stop();
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

export default FlowEnvironment;
