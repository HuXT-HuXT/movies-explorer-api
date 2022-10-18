const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { regex } = require('../constants/constants');
const {
  addMovie, getMovies, removeMovie,
} = require('../controllers/movies');

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().regex(regex),
    trailerLink: Joi.string().required().regex(regex),
    thumbnail: Joi.string().required().regex(regex),
    movieId: Joi.string().length(24).hex().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), addMovie);
router.get('/', getMovies);
router.delete('/_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().length(24).hex().required(),
  })
}), removeMovie);

module.exports = router;