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
	
    function RegisterDeviceNode(config){
		// init
		RED.nodes.createNode(this,config);
        var node = this;
		// config
		node.tenant = RED.nodes.getNode(config.tenant);
		// input
        node.on('input', function(msg_in) {
			var idType = getFromConfigOrMsg(node,config, msg_in, 'deviceIdType');
			var id = getFromConfigOrMsg(node, config, msg_in, 'deviceId');
			var managedObject = getFromConfigOrMsg(node, config, msg_in, 'managedObject');
			if (node.tenant) {
				node.tenant.check_registration(node, {"idType":idType,"id":id}, null, function(msg_out){
					if(msg_out.statusCode=="404"){
						node.tenant.create_inventory(node, null, managedObject, function(msg_out){
							if(msg_out.statusCode=="201"){
								var managedObjectId = msg_out.location.replace(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/,"$6");
								var externalId = {"type":idType,"externalId":id};
								node.tenant.register_device(node, { "managedObjectId": managedObjectId}, externalId, function(msg_out){
									if(msg_out.statusCode=="201"){
										msg_in.managedObjectId=managedObjectId;
										node.send(msg_in);
									}else{
										node.error("Error registering managed object", msg_out.statusMessage);
									}
								});
							}else{
								node.error("Error creating managed object", msg_out.statusMessage);
							}
						});
					}else if(msg_out.statusCode=="200"){
						var managedObjectId = msg_out.data.managedObject.id;
						msg_out = node.tenant.update_inventory(node, { "managedObjectId": managedObjectId}, managedObject, function(msg_out){
							if(msg_out.statusCode=="200"){
								msg_in.managedObjectId=managedObjectId;
								node.send(msg_in);
							}else{
								node.error("Error updating managed object", msg_out.statusMessage);
							}
						});
					}
				});
			} else {
				// No config node configured
				node.error("No tenant configuration present");
			}
        });
    }
    RED.nodes.registerType("base-reg-device",RegisterDeviceNode);
}