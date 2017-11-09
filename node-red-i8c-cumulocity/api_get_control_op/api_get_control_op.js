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
	
    function RegControlNotifNode(config){
		// init
		RED.nodes.createNode(this,config);
        var node = this;
		// config
		node.tenant = RED.nodes.getNode(config.tenant);
		// input
        node.on('input', function(msg_in) {
			var managedObjectId = getFromConfigOrMsg(node, config, msg_in, 'managedObjectId');
			var status = getFromConfigOrMsg(node, config, msg_in, 'status');
			if (node.tenant) {
				node.tenant.get_control_op(node, { "managedObjectId": managedObjectId, "status": status}, null, function(msg_out){
					msg_out.data.operations.forEach(function(operation) {
						node.send(Object.assign(msg_in,operation));
					});
				});
			} else {
				// No config node configured
				node.error("No tenant configuration present");
			}
        });
    }
    RED.nodes.registerType("api-get-control-op",RegControlNotifNode);
}