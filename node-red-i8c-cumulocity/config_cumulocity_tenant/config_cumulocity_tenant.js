/*!
 * node-red-i8c-cumulocity v1.0.0 (https://github.com/i8c)
 * Copyright (C) 2018 i8c NV
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = function(RED) {
	
	function parseInputData(input_data) {
		if(typeof input_data == 'string'){
			return input_data.replace(/\\\"/g, "\"");
		}else{
			return JSON.stringify(input_data);
		}
	}
	
    function ConfigCumulocityTenantNode(n) {
        RED.nodes.createNode(this,n);
		var Client = require('node-rest-client').Client;
		var options = { user: this.credentials.user, password: this.credentials.password, mimetypes: {json: ["application/json", "application/vnd.com.nsn.cumulocity.externalId+json", "application/vnd.com.nsn.cumulocity.error+json;charset=UTF-8 ;ver=0.9"]}};
		this.client = new Client(options);
		this.basepath="https://" + n.host + ":" + n.port;
		var jsonParser = this.client.parsers.find("JSON");
		if(jsonParser){
			this.client.parsers.add({
				"name":"JSON-default",
				"isDefault":true,
				"match":function(response){return true;},							
				"parse":function(byteBuffer,nrcEventEmitter,parsedCallback){
					jsonParser.parse(byteBuffer,nrcEventEmitter,parsedCallback);
				}
				});
		}else{
			console.log("JSON parser not found");
		}
		
		// GET CREDENTIALS
		this.get_credentials = function (node, input_params, input_data, callback) {
			var args = {data: parseInputData(input_data), headers: {"Content-Type": "application/vnd.com.nsn.cumulocity.deviceCredentials+json;"}};
			this.client.post(this.basepath + "/devicecontrol/deviceCredentials", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		 };
		 
		// CHECK REGISTRATION
		this.check_registration = function (node, input_params, input_data, callback) {
			console.log("check_registration");
			var args = {path: { "id": input_params.id, "idType": input_params.idType}};
			this.client.get(this.basepath + "/identity/externalIds/${idType}/${id}", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
		// CREATE INVENTORY
		this.create_inventory = function (node, input_params, input_data, callback) {
			console.log("create_inventory");
			var args = {data: parseInputData(input_data),headers: { "Content-Type": "application/vnd.com.nsn.cumulocity.managedObject+json" }};
			this.client.post(node.tenant.basepath + "/inventory/managedObjects", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
		// UPDATE INVENTORY
		this.update_inventory = function (node, input_params, input_data, callback) {
			console.log("update_inventory");
			console.log(input_params.managedObjectId);
			var args = {path: { "managedObjectId": input_params.managedObjectId}, data: parseInputData(input_data),headers: { "Content-Type": "application/vnd.com.nsn.cumulocity.managedObject+json" }};
			this.client.put(node.tenant.basepath + "/inventory/managedObjects/${managedObjectId}", args, function (data, response) {
				console.log(JSON.stringify({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location}));
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
		// REGISTER DEVICE
		this.register_device = function (node, input_params, input_data, callback) {
			console.log("register_device");
			var args = {path: { "managedObjectId": input_params.managedObjectId}, data: parseInputData(input_data),headers: { "Content-Type": "application/vnd.com.nsn.cumulocity.externalId+json" }};
			this.client.post(node.tenant.basepath + "/identity/globalIds/${managedObjectId}/externalIds", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
		// CREATE CHILD
		this.create_child = function (node, input_params, input_data, callback) {
			console.log("create_child");
			var args = {path: { "managedObjectId": input_params.managedObjectId}, data: parseInputData(input_data),headers: { "Content-Type": "application/vnd.com.nsn.cumulocity.managedObjectReference+json" }};
			this.client.post(node.tenant.basepath + "/inventory/managedObjects/${managedObjectId}/childDevices", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
		// GET CONTROL OPERATION
		this.get_control_op = function (node, input_params, input_data, callback) {
			console.log("get_control_op");
			var args = {path: { "managedObjectId": input_params.managedObjectId, "status": input_params.status}};
			this.client.get(node.tenant.basepath + "/devicecontrol/operations?agentId=${managedObjectId}&status=${status}", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
		// PUT CONTROL OPERATION
		this.put_control_op = function (node, input_params, input_data, callback) {
			console.log("put_control_op");
			var args = {path: { "operationId": input_params.operationId}, data: parseInputData(input_data), headers: { "Content-Type": "application/vnd.com.nsn.cumulocity.operation+json" }};
			console.log(args.data);
			this.client.put(node.tenant.basepath + "/devicecontrol/operations/${operationId}", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
		// REGISTER CONTROL NOTIFICATION
		this.reg_control_notif = function (node, input_params, input_data, callback) {
			console.log("reg_control_notif");
			var args = {data: parseInputData(input_data),headers: { "Content-Type": "application/json" }};
			this.client.post(node.tenant.basepath + "/devicecontrol/notifications", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
		// SEND MEASUREMENT
		this.send_measure = function (node, input_params, input_data, callback) {
			console.log("send_measure");
			var args = {data: parseInputData(input_data),headers: { "Content-Type": "application/vnd.com.nsn.cumulocity.measurement+json" }};
			this.client.post(node.tenant.basepath + "/measurement/measurements", args, function (data, response) {
				callback({data:data, statusCode: response.statusCode, statusMessage: response.statusMessage, location:response.headers.location});
			}).on('error', function (err) {
				node.error('something went wrong on the request', err.request.options);
			});
			this.client.on('error', function (err) {
				node.error('Something went wrong on the client', err);
			});
		};
		
    }
	
	RED.nodes.registerType("config-cumulocity-tenant",ConfigCumulocityTenantNode,{
        credentials: {
            user: {type:"text"},
            password: {type: "password"}
        }
    });
}