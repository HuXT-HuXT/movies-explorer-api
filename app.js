require('dotenv').config({ path: './.env' });
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');

console.log(process.env.NODE_ENV);

const PORT = process.env.PORT || 80;
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFound = require('./errors/NotFound');
const { rateLimiter } = require('./middlewares/rateLimiter');
const { cors } = require('./middlewares/cors');

mongoose.connect(process.env.NODE_ENV === 'production' ? process.env.DB : 'mongodb://localhost:27017/testmoviesdb', {
  useNewUrlParser: true,
  autoIndex: true,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);
app.use(rateLimiter);
app.use(cors);

app.use(require('./routes/sign'));
app.use(require('./middlewares/auth'));
app.use(require('./routes/users'));
app.use(require('./routes/movies'));

app.get('/signout', (req, res) => {
  res
    .cookie('jwt', '*', {
      maxAge: 10,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    .send({ message: 'bye bye' });
});

app.all('*', () => {
  throw new NotFound('404! Страница не найдена.');
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({ message: statusCode === 500 ? 'Ошибка по умолчанию' : message });

  next();
});

app.listen(PORT, () => {
  console.log('Server up');
});
