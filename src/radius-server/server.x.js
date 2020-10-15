// Example radius server doing authentication

var radius = require('radius');
var dgram = require("dgram");

var secret = 'radius_secret';
var server = dgram.createSocket("udp4");

radius.add_dictionary(__dirname + '/dictionaries/dictionary.mikrotik');

server.on("message", function (msg, rinfo) {
  var code, username, password, packet;
  try {
    packet = radius.decode({packet: msg, secret: secret});
  } catch (e) {
    console.log("Failed to decode radius packet, silently dropping:", e);
    return;
  }

  if (packet.code != 'Access-Request') {
    console.log('unknown packet type: ', packet.code);
    return;
  }

  console.log(packet)

  username = packet.attributes['User-Name'];
  password = packet.attributes['User-Password'];

  console.log('Access-Request for ' + username + ':' + password);

  if (username == 'halo' && password == 'loha') {
    code = 'Access-Accept';
  } else {
    code = 'Access-Reject';
  }

  var attrs = [
    ['NAS-Port-Type', packet.attributes['NAS-Port-Type']],
    ['Calling-Station-Id', packet.attributes['Calling-Station-Id']],
    ['Called-Station-Id', packet.attributes['Called-Station-Id']],
    ['NAS-Port-Id', packet.attributes['NAS-Port-Id']],
    ['User-Name', packet.attributes['User-Name']],
    ['NAS-Port', packet.attributes['NAS-Port']],
    ['Acct-Session-Id', packet.attributes['Acct-Session-Id']],
    ['Framed-IP-Address', packet.attributes['Framed-IP-Address']],
    ['User-Password', packet.attributes['User-Password']],
    ['Service-Type', packet.attributes['Service-Type']],
    ['NAS-Identifier', packet.attributes['NAS-Identifier']],
    ['NAS-IP-Address', packet.attributes['NAS-IP-Address']],
    ['Vendor-Specific', 'Mikrotik', [
      ['Mikrotik-Host-IP', packet.attributes['Vendor-Specific']['Mikrotik-Host-IP']],
      ['Mikrotik-Rate-Limit', '50M/50M'],
    ]],
  ];

  var response = radius.encode({
    code: code,
    secret: secret,
    attributes: attrs,
    identifier: packet.identifier,
    authenticator: packet.authenticator,
  });

  console.log(response);

  var x = radius.decode({packet: response, secret: secret});

  console.log(x);

  // var response = radius.encode_response({
  //   packet: packet,
  //   code: code,
  //   secret: secret
  // });

  console.log('Sending ' + code + ' for user ' + username);
  server.send(response, 0, response.length, rinfo.port, rinfo.address, function(err, bytes) {
    if (err) {
      console.log('Error sending response to ', rinfo);
    }
  });
});

server.on("listening", function () {
  var address = server.address();
  console.log("radius server listening " +
      address.address + ":" + address.port);
});

server.bind(1812);