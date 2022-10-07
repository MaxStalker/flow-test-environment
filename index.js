import { Emulator } from "./src/emulator";

(async () => {
  const emulator = new Emulator();
  await emulator.start();
  console.log("noice!");
  await emulator.stop();
})();
