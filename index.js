const express = require('express')
const Sequelize = require('sequelize')
const port = 6800
const app = express()
app.use(express.json)
const { DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    'test', // Название бд
    'postgres', // Имя постгреса
    'qwe123', // Пароль
    {
        dialect: 'postgres',
        host: 'localhost',
        port: '5432'
    })

const Users = sequelize.define('users', {
    id_user: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING }
}, { timestamps: false })


app.post('/registration', async (req, res) => {
    const { login, password } = req.body
    const home = await Users.Create({ login, password })
    return res.json(home)
})


app.post('/login', async (req, res) => {
    const { login, password } = req.body
    const home = await Users.FindOne({ where: { login, password } })
    return res.json(home);
})

sequelize.authenticate()
sequelize.sync()

app.listen(port)