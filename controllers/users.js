const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Conflict = require('../errors/Conflict');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');
const Unauthorized = require('../errors/Unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hashPassword) => {
      User.create({
        name, email, password: hashPassword,
      })
        .then((user) => {
          const { _id } = user;
          res.send({
            name, email, _id,
          });
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new Conflict('Email уже существует'));
          } else if (err.name === 'ValidationError') {
            next(new InputError('Переданы некорректные данные при создании пользователя.'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
      }
      res.send({
        name: user.name,
        email: user.email,
      });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      throw new NotFound(`Пользователь с указанным ${req.user._id} не найден.`);
    })
    .then((user) => {
      res.send({
        name, email, _id: user._id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные.'));
      } else if (err.codeName === 'DuplicateKey') {
        next(new Conflict(`${email} уже занят`));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
          }
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          );
          return res
            .cookie('jwt', token, {
              maxAge: 604800000,
              httpOnly: true,
              secure: true,
              sameSite: 'none',
            })
            .send({ message: `Welcome, ${user.name}!` });
        });
    })
    .catch(next);
};

module.exports = {
  createUser,
  updateUser,
  login,
  getCurrentUser,
};
