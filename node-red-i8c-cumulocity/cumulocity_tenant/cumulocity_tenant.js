module.exports = function(RED) {
    function CumulocityTenantNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.port = n.port;
		this.credentials.username = n.credentials.username;
		this.credentials.password = n.credentials.password;
    }
    RED.nodes.registerType("cumulocity-tenant",CumulocityTenantNode);
}