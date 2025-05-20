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

// Middleware для проверки аутентификации по логину/паролю из тела запроса
const authenticateUser = async (req, res, next) => {
    try {
        const { login, password } = req.body;
        if (!login || !password) {
            return res.status(400).json({ message: 'Требуются логин и пароль' });
        }
        const user = await Users.findOne({ where: { login, password } });
        if (!user) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Не удалось выполнить проверку подлинности' });
    }
};

// Middleware для проверки ролей
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Пользователь не прошел проверку подлинности' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Недостаточные разрешения' });
        }
        
        next();
    };
};

app.post('/registration', async (req, res) => {
    try {
        const { login, password } = req.body;
        const user = await Users.create({ login, password });
        return res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Не удалось выполнить регистрацию' });
    }
});

app.post('/login', authenticateUser, async (req, res) => {
    // После успешной аутентификации в middleware просто возвращаем пользователя
    return res.json({
        message: 'Вход в систему прошел успешно',
        user: {
            id: req.user.id_user,
            login: req.user.login,
            role: req.user.role
        }
    });
});
sequelize.authenticate()
sequelize.sync()

app.listen(port)