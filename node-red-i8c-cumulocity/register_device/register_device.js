module.exports = function(RED) {
    function RegisterDeviceNode(config) 
		// init
		RED.nodes.createNode(this,config);
        var node = this;
		var Client = require('node-rest-client').Client;
		// config
		this.tenant = RED.nodes.getNode(config.tenant);
		// input
        node.on('input', function(msg) {
			if (this.tenant) {
				// REST client
				var options = { user: this.tenant.credentials.username, password: this.tenant.credentials.password };
				var client = new Client(options);
				var args = {
					data: msg.payload,
					headers: { "Content-Type": "application/json" }
				};
			 
				client.post("https://" + this.tenant.host + ":" + this.tenant.port + "/devicecontrol/deviceCredentials", args, function (data, response) {
					// parsed response body as js object 
					console.log(data);
					// raw response 
					console.log(response);
				});
				msg.payload = msg.payload.toLowerCase();
				node.send(msg);
			} else {
				// No config node configured
				this.error("No tenant configuration present");
			}
        });
    }
    RED.nodes.registerType("register-device",RegisterDeviceNode);
}