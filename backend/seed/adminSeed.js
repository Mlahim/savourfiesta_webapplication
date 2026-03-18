require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
    try {
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

        if (existingAdmin) {
            console.log('Admin already exists');
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('Updated role to admin');
            }
            if (!existingAdmin.isVerified) {
                existingAdmin.isVerified = true;
                await existingAdmin.save();
                console.log('Marked admin as verified');
            }
        } else {
            const hashedPassword = await bcrypt.hash('123456', 10);
            await User.create({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
        }

        console.log('✅ Admin user created/updated: admin@gmail.com / 123456');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
