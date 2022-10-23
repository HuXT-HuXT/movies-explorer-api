require('dotenv').config({ path: '../../.env' });
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');

console.log(process.env.NODE_ENV);

const PORT = process.env.PORT || 3000;
const routerUsers = require('./routes/users');
const routerMovies = require('./routes/movies');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFound = require('./errors/NotFound');

mongoose.connect('mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
  autoIndex: true,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);

app.use('/users', auth,routerUsers);
app.use('/movies', auth, routerMovies);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
  }),
}), createUser);

app.get('/signout', auth, (req, res) => {
  res
    .cookie('jwt', '*', {
      maxAge: 10,
      httpOnly: true,
      // secure: true,
      // sameSite: 'none',
    })
    .send({ message: 'bye bye' });
});

app.all('*', auth, () => {
  throw new NotFound('404! Страница не найдена.');
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {

  res.end();

  next();
});

app.use((err, req, res, next) => {

  res.end();

  next();
});

app.listen(PORT, () => {
  console.log('Server up');
});