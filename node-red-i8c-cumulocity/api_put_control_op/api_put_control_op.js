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
	
    function PutControlOpNode(config){
		// init
		RED.nodes.createNode(this,config);
        var node = this;
		// config
		node.tenant = RED.nodes.getNode(config.tenant);
		// input
        node.on('input', function(msg_in) {
			var operationId = getFromConfigOrMsg(node, config, msg_in, 'operationId');
			var operation = getFromConfigOrMsg(node, config, msg_in, 'operation');
			if (node.tenant) {
				node.tenant.put_control_op(node, { "operationId": operationId}, operation, function(msg_out){
					node.send(Object.assign(msg_in,msg_out));
				});
			} else {
				// No config node configured
				node.error("No tenant configuration present");
			}
        });
    }
    RED.nodes.registerType("api-put-control-op",PutControlOpNode);
}