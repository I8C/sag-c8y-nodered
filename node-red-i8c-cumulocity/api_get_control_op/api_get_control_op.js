/*!
 * node-red-i8c-cumulocity v1.0.0 (https://github.com/i8c)
 * Copyright (C) 2018 i8c NV
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */
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