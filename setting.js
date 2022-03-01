const path = require("path");
const mockRules = require("./mock");
module.exports = {
  defaultIndex: ["index.html", "index.htm"],
  mock: false,
  // mock: mockRules,
  htmlUrl: "/",
  html: path.join(__dirname, "./html"),
  // 未匹配到的地址跳转到首页
  toIndex: true,
  port: 8080,
  host: "0.0.0.0",
  proxy: {
    "/auth": {
      enable: true,
      changeOrigin: true,
      prependPath: true,
      target: "http://101.34.30.242:8009/auth",
      pathRewrite: { "^/auth": "" },
      proxyTimeout: 10e3,
      logLevel: "debug",
    },
    "/pull": {
      enable: true,
      changeOrigin: true,
      prependPath: false,
      ws: false,
      target: "http://101.34.30.242:8009",
      pathRewrite: { "^/pull": "/pull" },
    },
  },
};
