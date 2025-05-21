const express = require('express')
const Sequelize = require('sequelize')
const port = 6800
const app = express()
app.use(express.json())
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
    login: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' }
}, { timestamps: false })

const Profiles = sequelize.define('profiles', {
    id_profile: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    age: { type: DataTypes.INTEGER }
}, { timestamps: false })

const FavoriteProducts = sequelize.define('favorite_products', {
    id_product: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_name: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10, 2) }
}, { timestamps: false })

Users.hasOne(Profiles, { foreignKey: 'user_id' });
Profiles.belongsTo(Users, { foreignKey: 'user_id' });

Users.hasMany(FavoriteProducts, { foreignKey: 'user_id' });
FavoriteProducts.belongsTo(Users, { foreignKey: 'user_id' });

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

const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }
        next();
    }
}

app.post('/registration', async (req, res) => {
    try {
        const { login, password, secret_key } = req.body;
        const role = secret_key === 'mkit' ? 'admin' : 'user';

        const user = await Users.create({
            login,
            password,
            role
        });

        return res.json({
            message: 'Регистрация прошла успешно',
            user: {
                id: user.id_user,
                login: user.login,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Не удалось выполнить регистрацию' });
    }
});

app.post('/login', authenticateUser, async (req, res) => {
    return res.json({
        message: 'Вход в систему прошел успешно',
        user: {
            id: req.user.id_user,
            login: req.user.login,
            role: req.user.role
        }
    });
});

app.get('/admin', authenticateUser, checkRole('admin'), async (req, res) => {
    res.json({ message: 'Добро пожаловать в админ-панель' });
});

sequelize.authenticate()
sequelize.sync()
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});