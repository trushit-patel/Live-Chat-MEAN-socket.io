const Note = require('../models/user.model');
const userService = require('../services/user.service');

exports.registerMe = async (req, res, next) => {
	// return res.json("Sucess");
	userService.create(req.body)
		.then(() => res.json({}))
		.catch(err => next(err));
}

exports.loginMe = async (req, res, next) => {
	try {
		let user = await userService.login(req.body);
		if (user) {
			res.json(user);
		} else {
			res.status(400).json({ message: 'Username or password is incorrect' })
		}
	} catch (error) {
		next(error);
	}
}

exports.getAll = async (req, res, next) => {
	try {
		let users = await userService.getAll();
		res.json(users);
	} catch (error) {
		next(error)
	}
}

exports.getAllUsersExceptOne = async (req, res, next) => {
	try {
		let users = await userService.getAllUsersExceptOne(req.user.username);
		res.json(users);
	} catch (error) {
		next(error)
	}
}

exports.getCurrent = async (req, res, next) => {
	userService.getById(req.user.sub)
		.then(user => user ? res.json(user) : res.sendStatus(404))
		.catch(err => next(err));
}

exports.getById = async (req, res, next) => {
	userService.getById(req.params.id)
		.then(user => user ? res.json(user) : res.sendStatus(404))
		.catch(err => next(err));
}

exports.update = async (req, res, next) => {
	userService.update(req.params.id, req.body)
		.then(() => res.json({}))
		.catch(err => next(err));
}

exports._delete = async (req, res, next) => {

	const currentUserID = req.user.sub; // assuming you're using JWT and the sub field is the user ID
	const userIDToDelete = req.params.id;
	if (currentUserID !== userIDToDelete) {
		return res.status(403).send({ message: 'You are not authorized to delete this user.' });
	}

	userService._delete(req.params.id)
		.then(() => res.json({}))
		.catch(err => next(err));
}