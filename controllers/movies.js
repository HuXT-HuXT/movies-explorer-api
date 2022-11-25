const Movie = require('../models/movie');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');
const Forbidden = require('../errors/Forbidden');

const addMovie = (req, res, next) => {
  const userId = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
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
    trailerLink,
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
        next(new InputError('Переданы некорректные данные при сохранении фильма.'));
      } else {
        next(err);
      }
    });
};

const getMovies = (req, res, next) => {
  const userId = req.user._id;
  Movie.find({ owner: userId })
    .then((movies) => {
      res.send({ data: movies });
    })
    .catch(next);
};

const removeMovie = (req, res, next) => {
  const { _id } = req.params;
  const userId = req.user._id;
  Movie.findById(_id)
    .orFail(() => {
      throw new NotFound(`Фильм с указанным ${_id} не найден.`);
    })
    .then((movie) => {
      const owner = movie.owner.toString();
      if (owner !== userId) {
        throw new Forbidden('Фильм сохранён другим пользователем.');
      }

      Movie.deleteOne(movie)
        .then(() => res.send({ data: movie }))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Невалидный идентификатор фильма.'));
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
