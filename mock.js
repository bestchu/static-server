module.exports = {
		"/": [
		  {
			name: "hello",
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
	  