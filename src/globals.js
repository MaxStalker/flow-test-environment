import { Emulator } from "./emulator";

export const setup = async (globalConfig, projectConfig) => {
  console.log("We will start single emulator here");
  const emulator = new Emulator();
  const processName = projectConfig.testEnvironmentOptions.emulator;
  console.log("Process Name:", processName);
  await emulator.start(processName);
  globalThis.__EMULATOR__ = emulator;

  // We can pass this one around and read later on! :)
  // Though apparently it's a bug/feature
  process.env.__EMULATOR_PORT__ = emulator.port;
  return true;
};
export const teardown = async () => {
  console.log("---> Stopping emulator");
  await globalThis.__EMULATOR__.stop();
  return true;
};
