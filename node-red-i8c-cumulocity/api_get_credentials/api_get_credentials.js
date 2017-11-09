module.exports = function(RED) {
	
	function getFromConfigOrMsg(node,config, msg, name){
		var value;
		if(!config[name]){
			if(msg[name])
				value=msg[name];
			else
				node.error("No property " + name + " found");
		}else
			value=config[name];
		return value;
	}
	
    function DeviceGetCredentialsNode(config){
		// init
		RED.nodes.createNode(this,config);
        var node = this;
		// config
		node.tenant = RED.nodes.getNode(config.tenant);
		// input
        node.on('input', function(msg_in) {
			var deviceCredentials = getFromConfigOrMsg(node, config, msg_in, 'deviceCredentials');
			if (node.tenant) {
				node.tenant.get_credentials(node, null, msg_in.input_data, function(msg_out){
					msg_out.managedObject = msg_in.managedObject;
					node.send(msg_out);
				});
			} else {
				// No config node configured
				node.error("No tenant configuration present");
			}
        });
    }
    RED.nodes.registerType("api-get-credentials",DeviceGetCredentialsNode);
}