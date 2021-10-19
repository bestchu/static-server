const path = require("path");
const mockRules = require("./mock");
module.exports = {
  defaultIndex: ["index.html", "index.htm"],
  mock: mockRules,
  htmlUrl: "/",
  html: path.join(__dirname, "./html"),
  // 未匹配到的地址跳转到首页
  toIndex: true,
  port: 8080,
  host: "0.0.0.0",
  proxy: {
    "/s6/weather/now": {
      enable: true,
      changeOrigin: true,
      prependPath: false,
      target: "https://api.heweather.net/",
      pathRewrite: { "^/s6/weather/now": "/s6/weather/now" },
    },
    "/socket.io": {
      enable: true,
      changeOrigin: true,
      prependPath: false,
      ws: true,
      target: "http://127.0.0.1:7001",
      pathRewrite: { "^/socket.io": "/socket.io" },
    },
  },
};
