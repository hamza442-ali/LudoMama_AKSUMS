const User = require('../../models/admin/userModel');

const createUser = (req, res) => {
    if (!req.body.username || !req.body.email || !req.body.password) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    });

    user.save()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while creating the User."
        }));
};

const getAllUsers = (req, res) => {
    User.find()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        }));
};

const deleteUserById = (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: `Cannot delete User with id=${req.params.id}. Maybe User was not found!` });
            } else {
                res.send({ message: "User was deleted successfully!" });
            }
        })
        .catch(err => res.status(500).send({
            message: err.message || "Could not delete User with id=" + req.params.id
        }));
};

module.exports = {
    createUser,
    getAllUsers,
    deleteUserById
};
