# 静态页面服务器，将静态页面打包为可执行文件，方便项目演示。
static-server 静态页面服务器，支持接口proxy及mock

## 使用方法
1. 安装依赖 `npm install`
1. 调式 `npm run dev`
## 直接使用
1. 下载操系统对应的可执行文件直接运行即可
    - win [server-win](https://github.com/bestchu/static-server/releases/download/1.0.1/server-win.exe)
    - linux [server-linux](https://github.com/bestchu/static-server/releases/download/1.0.1/server-linux)
    - macos [server-macos](https://github.com/bestchu/static-server/releases/download/1.0.1/server-macos)
1. 第一次执行会在当前目录下生产配置文件
## setting.js 配置说明
- defaultIndex:["index.html","index.htm"]   默认首页列表
- mock:Mock规则|false   Mock配置，false 禁用
- htmlUrl:"/"   静态页面入口路径
- toIndex:true  未匹配的静态页面是否输出默认首页，适用于vue,react等单页应用
- port:8080 应用启动端口
- host:"0.0.0.0" 应用绑定的IP
- proxy:{} 代理规则，支持代理websocket
## 打包为可执行文件
1. 打包静态服务(不含静态文件及setting.js、server.js、mock.js配置文件) `npm run build:server`
1. 打包应用未单一可执行文件 `npm run build:app`

##说明
1. proxy 请参照 [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
1. mock 语法参照 [MockJs](http://mockjs.com/)

    ### mock配置为 `{"接口根路径":["mock规则"]}`
    
    - mock规则
    ```js
    {
        "name":"接口名称"，
        "method":"请求方法",
        "url":"接口路径", //路由支持参数 /article/:id
        "on":true,  //是否开启
        "body":{    
            // 接口响应参数，也可为方法
            // 方法定义 _req 参照 express req
            // function({_req, Mock})=>{     
            //      return {} // 返回响应参数
            //  }
            // 接口参数定义，参照Mock
            "_meta":{   // 接口响应定义
                "statusCode":200,// 响应http状态码
                "headers":{"key":"value"},// 响应http header
                "cookies":{"key":"value"},// 响应cookie
            }
        }
    }
    ```
    - 接口响应参数 定义示例
    ```js
    // mock 语法
    {
        "code":200,
        "rows|10":{
            "id":"@integer(10000)",
            "name":"@cname",
            "url": "@url"
        },
        "message":"ok",
        "_meta":{"statusCode":200}
    }
    // 通过方法返回
    function({_req, Mock}){
        return {
            "code":function({_req, Mock}){
                return 200;
            },
            "nodes|5":[function({_req, Mock}){
                return {
                    "id":Mock.mock("@integer(10000)"),
                    "name":"@cname",
                    "url": "@url"
                }
            }],
            "rows|10":{
                "id":"@integer(10000)",
                "name":"@cname",
                "url": "@url"
            },
            "message":"ok",
            "_meta":function(){
                return {
				  statusCode: 200,
				  headers: {
					Server: "static-server",
				  },
				  cookies: {
					t: Date.now(),
				  },
				}
            }
        }
    }
    ```
    