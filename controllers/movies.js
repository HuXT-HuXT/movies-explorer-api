const Movie = require('../models/movie');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');
const { reset } = require('nodemon');

const addMovie = (req, res, next) => {
  const userId = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    owner: userId,
    movieId,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные при создании карточки.'));
      } else {
        next(err);
      }
    });
};

const getMovies = (req, res, next) => {
  Movie.find({})
  .then((cards) => {
    res.send({ data: cards });
  })
  .catch(next);
};

const removeMovie = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;
  Movie.findById(movieId)
    .orFail(() => {
      throw new NotFound(`Карточка с указанным ${cardId} не найдена.`);
    })
    .then((movie) => {
      const owner = movie.owner;
      if (owner !== userId) {
        throw new Forbidden('Карточка создана другим пользователем.');
      }

      Movie.deleteOne(movie)
        .then(() => res.send({ data: card }))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор карточки.'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  addMovie,
  getMovies,
  removeMovie,
};