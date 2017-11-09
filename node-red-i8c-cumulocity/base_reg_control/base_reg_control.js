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
	
	function pollControlOp(node, msg_in, managedObjectId,clientId){
		node.tenant.reg_control_notif(node, null, [{"id": "3","connectionType": "long-polling","channel": "/meta/connect","clientId": clientId}], function(msg_out){
			if(msg_out.statusCode=="200"){
				if (msg_out.data instanceof Array){
					msg_out.data.forEach(function(operation) {
						if(operation.data){
							console.log("+++ " + JSON.stringify(operation));
							node.send(Object.assign(msg_in,operation.data));
							node.status({fill:"red",shape:"ring",text:"waiting"});
						}
					});
				}
				//START POLLING AGAIN
				pollControlOp(node, msg_in, managedObjectId,clientId);
			}else{
				node.status({fill:"red",shape:"ring",text:"error"});
			}
			
		});
		node.status({fill:"green",shape:"dot",text:"listening"});
	}
	
    function RegisterControlNode(config){
		// init
		RED.nodes.createNode(this,config);
        var node = this;
		// config
		node.tenant = RED.nodes.getNode(config.tenant);
		// input
        node.on('input', function(msg_in) {
			var managedObjectId = getFromConfigOrMsg(node, config, msg_in, 'managedObjectId');
			if (node.tenant) {
				node.tenant.reg_control_notif(node, null, [{"id": "1","supportedConnectionTypes": ["long-polling"],"channel": "/meta/handshake","version": "1.0"}], function(msg_out){
					if(msg_out.statusCode=="200"){
						var clientId = msg_out.data[0].clientId;
						node.tenant.reg_control_notif(node, null, [{"id": "2","channel": "/meta/subscribe","subscription": ("/"+ managedObjectId),"clientId":clientId}], function(msg_out){
							if(msg_out.statusCode=="200"){
								pollControlOp(node, msg_in, managedObjectId,clientId);
								// GET PENDING
								node.tenant.get_control_op(node, { "managedObjectId": managedObjectId, "status": "PENDING"}, null, function(msg_out){
									if(msg_out.statusCode=="200"){
										msg_out.data.operations.forEach(function(operation) {
											node.send(Object.assign(msg_in,operation));
										});
									}
								});
							}else{
								node.error("Error registering managed object for control notification", msg_out.statusMessage);
							}
						});
					}else {
						node.error("Error handshaking for control notification", msg_out.statusMessage);
					}
				});
			} else {
				// No config node configured
				node.error("No tenant configuration present");
			}
        });
    }
    RED.nodes.registerType("base-reg-control",RegisterControlNode);
}