require("dotenv").config({ path: `${__dirname}/.env` });

const radius = require("radius");
const userRepo = require("./repository/user");

const encodeResponse = (data) => {
  console.log("Preparing response, data: ", data);
  return radius.encode(data);
}

exports.handleAccessRequest = (packet) => {
  let responseData = {
    secret: process.env.RADIUS_SECRET,
    identifier: packet.identifier,
    authenticator: packet.authenticator,
  };

  const user = userRepo.verify(
    packet.attributes["User-Name"],
    packet.attributes["User-Password"]
  );

  if (user === undefined) {
    responseData.code = "Access-Reject";
    return encodeResponse(responseData)
  }

  Object.assign(responseData, {
    code: "Access-Accept",
    attributes: [
      [
        "Vendor-Specific",
        "Mikrotik",
        [
          ["Mikrotik-Group", user.group],
          ["Mikrotik-Rate-Limit", user.rate_limit],
        ],
      ],
    ],
  });

  return encodeResponse(responseData);
};

exports.handleAccountingRequest = (packet) => {
  let responseData = {
    code: "Accounting-Response",
    secret: process.env.RADIUS_SECRET,
    identifier: packet.identifier,
    authenticator: packet.authenticator,
  };

  return encodeResponse(responseData);
};
