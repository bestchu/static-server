const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multer = require("multer"); // v1.0.5
const upload = multer(); // for parsing multipart/form-data
const fs = require("fs");
const path = require("path");
const Mock = require("mockjs");
const serveIndex = require("serve-index");

function morkBuild(obj, req) {
  if (typeof obj === "function") {
    return obj({ _req: req, Mock });
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => morkBuild(item, req));
  } else if (typeof obj === "object") {
    const objMap = Object.entries(obj).map(([key, value]) => {
      if (typeof value === "function") {
        return [key, value({ _req: req, Mock })];
      }
      if (typeof value === "object" || Array.isArray(value)) {
        return [key, morkBuild(value, req)];
      }
      return [key, value];
    });
    return Object.fromEntries(objMap);
  }
  return obj;
}

function main(setting) {
  const app = express();
  const { createProxyMiddleware } = require("http-proxy-middleware");
  app.use(cookieParser()); // for parsing cookie
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  const settingPath = path.join(process.cwd(), "./setting.js");
  if (setting === undefined && fs.existsSync(settingPath)) {
    setting = require(settingPath);
  }
  //此处设置配置文件的路径
  if (setting) {
    // mock 配置
    if (setting.mock) {
      const mockConfig = Object.entries(setting.mock);
      for (const [mockBaseUrl, morkRules] of mockConfig) {
        console.log("[MOCK]", mockBaseUrl);
        app.use(mockBaseUrl, upload.array(), function (req, res, next) {
          for (const morkRule of morkRules) {
            if (
              morkRule.on &&
              req.path === morkRule.url &&
              req.method.toLowerCase() === morkRule.method.toLowerCase()
            ) {
              const { _meta = {}, ...morkRes } = morkBuild(morkRule.body, req);
              const meta = Object.assign(
                { statusCode: 200, headers: {}, cookies: {} },
                _meta
              );
              // 设置响应状态码
              res.statusCode = meta.statusCode;
              // 设置header参数
              Object.entries(meta.headers).forEach(([key, val]) => {
                res.setHeader(key, val);
              });
              // 设置cookie参数
              Object.entries(meta.cookies).forEach(([key, val]) => {
                res.cookie(key, val);
              });
              res.send(Mock.mock(morkRes));
              return;
            }
          }
          if (req.accepts("json")) {
            res.send({
              code: 200,
              data: null,
              message: "接口未定义",
            });
            return;
          }
          next();
        });
      }
    }
    // proxy 配置
    if (setting.proxy) {
      const proxyConfig = Object.entries(setting.proxy);
      for (const [proxyBaseUrl, proxyOption] of proxyConfig) {
        app.use(proxyBaseUrl, createProxyMiddleware(proxyOption));
      }
    }
    // html 配置
    console.log(setting.html, fs.existsSync(setting.html));
    if (setting.html && fs.existsSync(setting.html)) {
      app.use(express.static(setting.html, {}));
      //需要配置在 proxy配置后面
      app.use(setting.htmlUrl, serveIndex(setting.html, { icons: true }));
      for (const filename of setting.defaultIndex) {
        const filePath = path.join(setting.html, filename);
        if (fs.existsSync(filePath)) {
          // const fileBody = fs.readFileSync(filePath, { encoding: "utf-8" });
          if (setting.toIndex) {
            app.use(setting.htmlUrl + "*", function (req, res) {
              if (req.accepts("html")) {
                res.contentType = "text/html";
                res.sendFile(filePath);
              }
            });
          }
          break;
        }
      }
    }
    app.listen(setting.port, setting.host, function () {
      console.log("服务启动成功，端口为:" + setting.port);
    });
  } else {
    // 生成 setting.js mock.js 文件
    const settingTemplate = `const path = require("path");
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
    `;
    const mockTemplate = `module.exports = {
      "/api": [
        {
        name: "Hello Word",
        url: "/hello",
        method: "get",
        on: true,
        body: function () {
          return {
          code: 200,
          message: "ok",
          _meta: {
            statusCode: 200,
            headers: {
            Server: "static-server",
            },
            cookies: {
            t: Date.now(),
            },
          },
          "rows|5": [
            {
            "name|+1": ["Hello", "Mock.js", "!"],
            },
          ],
          };
        },
        },
      ],
      };
      `;
    fs.writeFileSync(settingPath, settingTemplate, { encoding: "utf-8" });
    fs.writeFileSync(path.join(process.cwd(), "./mock.js"), mockTemplate, {
      encoding: "utf-8",
    });
    fs.mkdirSync(path.join(process.cwd(), "./html"));
    fs.writeFileSync(
      path.join(process.cwd(), "./html/index.html"),
      "<html><body>static-server</body></html>",
      { encoding: "utf-8" }
    );
  }
}
if (require.main.filename === __filename) {
  main();
}
module.exports = main;
