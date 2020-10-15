require("dotenv").config({ path: `${__dirname}/.env` });

const host = process.env.RADIUS_HOST;
const port = process.env.RADIUS_PORT;

const dgram = require("dgram");
const radius = require("radius");
const handler = require("./handler");

radius.add_dictionary(`${__dirname}/dictionary.mikrotik`);

const server = dgram.createSocket("udp4");

server.on("listening", () =>
  console.log(`radius-server listening on ${host}:${port}`)
);

server.on("message", (message, rinfo) => {
  let packet = null;
  let response = null;

  try {
    packet = radius.decode({
      packet: message,
      secret: process.env.RADIUS_SECRET,
    });
  } catch (error) {
    console.log("Failed to decode radius packet, silently dropping:", error);
    return;
  }

  console.log(
    `Incoming packet, code: "${packet.code}", attributes: `,
    packet.attributes
  );

  switch (packet.code) {
    case "Access-Request":
      response = handler.handleAccessRequest(packet);
      break;
    case "Accounting-Request":
      response = handler.handleAccountingRequest(packet);
      break;
    default:
      console.log("Unknown packet type: ", packet.code);
      break;
  }

  if (response === null) {
    console.log("Failed to build response, silently dropping");
    return;
  }

  server.send(response, 0, response.length, rinfo.port, rinfo.address);
});

server.bind(port, host);
