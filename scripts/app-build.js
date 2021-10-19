const { exec } = require("pkg");
const path = require("path");
const fs = require("fs");
const setting = require("../setting");
process.nextTick(async () => {
  const htmlDir = setting.html
    ? path
        .relative(path.join(__dirname, "./app/index.js"), setting.html)
        .replace(new RegExp(path.delimiter, "g"), "/")
    : false;
  const packageJson = {
    bin: "index.js",
    pkg: {
      assets: htmlDir ? [htmlDir] : [],
    },
  };
  fs.writeFileSync(
    path.join(__dirname, "./app/package.json"),
    JSON.stringify(packageJson),
    {
      encoding: "utf-8",
    }
  );
  await exec([
    "./scripts/app",
    "--target",
    // "win,macos,linux",
    "host",
    "--output",
    "bin/app",
  ]);
});
