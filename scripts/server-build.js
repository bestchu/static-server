const { exec } = require("pkg");
process.nextTick(async () => {
  await exec([
    "./scripts/server/index.js",
    "--target",
    // "win,macos,linux",
    "host",
    "--output",
    "bin/server",
  ]);
});
