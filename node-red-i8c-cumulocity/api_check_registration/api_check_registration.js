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
	
    function CheckRegistrationNode(config){
		// init
		RED.nodes.createNode(this,config);
        var node = this;
		// config
		node.tenant = RED.nodes.getNode(config.tenant);
		// input
        node.on('input', function(msg_in) {
			var idType = getFromConfigOrMsg(node,config, msg_in, 'deviceIdType');
			var id = getFromConfigOrMsg(node, config, msg_in, 'deviceId');
			if (node.tenant) {
				var msg_out = node.tenant.check_registration(node, {"idType":idType,"id":id}, null);
				msg_out.managedObject = msg_in.managedObject;
				node.send(msg_out);
			} else {
				// No config node configured
				node.error("No tenant configuration present");
			}
        });
    }
    RED.nodes.registerType("api-check-registration",CheckRegistrationNode);
}