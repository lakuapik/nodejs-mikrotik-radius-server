const util = require("../../util");

const users = [
  {
    id: 1,
    username: "user1",
    password: util.sha1("secret"),
    group: "uprof1",
    rate_limit: "50M/50M",
    session_time: 60, // in seconds
  },
  {
    id: 1,
    username: "user2",
    password: util.sha1("secret"),
    group: "uprof1",
    rate_limit: "20M/20M",
    session_time: 60 * 2, // in seconds
  },
];

exports.verify = (username, password) => {
  return users.find(
    (u) => username == u.username && util.sha1(password) == u.password
  );
};
