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