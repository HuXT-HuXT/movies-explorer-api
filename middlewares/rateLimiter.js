const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: 'Превышен лимит обращений: 5 обращений за 2 минуты, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { rateLimiter };
