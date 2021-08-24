'use strict';

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const UserSchema = require('./src/models/users');
const basicAuth = require('./src/middleware/basic');
const bearerAuth = require('./src/middleware/bearer');
const acl = require('./src/middleware/acl');

const app = express();
const sequelize = new Sequelize('postgres://postgres@localhost:5432/bearerauth');

const Users = UserSchema(sequelize, DataTypes);


// app level middleware
app.use(express.json());

// {"username":"test", "password":"test"}
app.post('/signup', (req, res) => {
    // check if user name exists
    console.log(req.body);
    Users.create(req.body)
        .then(user => res.status(201).send(user))
        .catch(err => res.status(400).send(err))
});

app.post('/signin', basicAuth(Users), (req, res) => {
    // the user will have the user info and the token
    res.status(200).send(req.user);
});

app.get('/user', bearerAuth(Users), acl('read'), (req, res) => {
    res.status(200).send(req.user);
});

app.post('/create', bearerAuth(Users), acl('create'), (req, res) => {
    res.status(200).send('Ok! I have create permissions');
});

app.put('/update', bearerAuth(Users), acl('update'), (req, res) => {
    res.status(200).send('Ok! I have update permissions');
});

app.delete('/delete', bearerAuth(Users), acl('delete'), (req, res) => {
    res.status(200).send('Ok! I have delete permissions');
});

// update

sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('Listening on port 3000'));
    }).catch(err => console.log(err));