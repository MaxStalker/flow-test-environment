import NodeEnvironment from "jest-environment-node";
import randomString from "crypto-random-string";

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
    this.global.emulatorHash = randomString({ length: 10 });
  }

  // Teardown Phase
  async teardown() {
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

export default FlowEnvironment;
