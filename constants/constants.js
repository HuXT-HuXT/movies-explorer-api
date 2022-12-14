const regex = /http(s?):\/\/(www\.)?[0-9a-zA-Z-]+\.[a-zA-Z]+([0-9a-zA-Z-._~:/?#[\]@!$&'()*+,;=]+)/;
const allowedCors = [
  'https://huxt-huxt.nomoredomains.club',
  'http://localhost:3000',
  'http://localhost:3190',
];
const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

module.exports = {
  regex,
  allowedCors,
  DEFAULT_ALLOWED_METHODS,
};
