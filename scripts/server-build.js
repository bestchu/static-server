const { exec } = require("pkg");
process.nextTick(async () => {
  await exec([
    "./scripts/server/index.js",
    "--target",
    "host",
    "--output",
    "bin/server",
  ]);
});
