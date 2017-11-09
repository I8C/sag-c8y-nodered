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
			var notifications = getFromConfigOrMsg(node, config, msg_in, 'notifications');
			if (node.tenant) {
				node.tenant.reg_control_notif(node, null, notifications, function(msg_out){
					node.send(Object.assign(msg_in,msg_out));
				});
			} else {
				// No config node configured
				node.error("No tenant configuration present");
			}
        });
    }
    RED.nodes.registerType("api-reg-control-notif",RegControlNotifNode);
}