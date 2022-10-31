const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const Unauthorized = require('../errors/Unauthorized');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    next(new Unauthorized('Необходима авторизацция'));

    return;
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new Unauthorized('Необходима авторизацция'));
  }

  req.user = payload;

  next();
};
