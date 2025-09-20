/**
 * Firebase Setup Script for Super Mall Web Application
 * Run this script to initialize Firebase and create admin user
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhLLknFT2blIXTm7Fz7UbsRYOufIyVWkM",
    authDomain: "super-mall-webapp-96de0.firebaseapp.com",
    projectId: "super-mall-webapp-96de0",
    storageBucket: "super-mall-webapp-96de0.firebasestorage.app",
    messagingSenderId: "516740635167",
    appId: "1:516740635167:web:c39f2abb6d2c15f367132a",
    measurementId: "G-TBQSJ30QWX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Create admin user
 */
async function createAdminUser(email, password, displayName = 'Admin User') {
    try {
        console.log('Creating admin user...');
        
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('User created successfully:', user.uid);
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: email,
            displayName: displayName,
            role: 'admin',
            createdAt: new Date(),
            lastLoginAt: new Date()
        });
        
        console.log('Admin user document created in Firestore');
        console.log('Admin user setup completed successfully!');
        
        return user;
    } catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    }
}

/**
 * Create sample data
 */
async function createSampleData() {
    try {
        console.log('Creating sample data...');
        
        // Create sample floors
        const floors = [
            { name: 'Ground Floor', description: 'Main entrance and food court' },
            { name: 'First Floor', description: 'Fashion and electronics' },
            { name: 'Second Floor', description: 'Home and lifestyle' },
            { name: 'Third Floor', description: 'Entertainment and services' }
        ];
        
        for (const floor of floors) {
            await setDoc(doc(db, 'floors', Date.now().toString()), {
                ...floor,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        // Create sample categories
        const categories = [
            { name: 'Fashion', description: 'Clothing and accessories', icon: 'fas fa-tshirt' },
            { name: 'Electronics', description: 'Gadgets and devices', icon: 'fas fa-laptop' },
            { name: 'Food & Beverage', description: 'Restaurants and cafes', icon: 'fas fa-utensils' },
            { name: 'Home & Garden', description: 'Furniture and decor', icon: 'fas fa-home' },
            { name: 'Health & Beauty', description: 'Cosmetics and wellness', icon: 'fas fa-heart' },
            { name: 'Sports & Fitness', description: 'Sports equipment and gym', icon: 'fas fa-dumbbell' }
        ];
        
        for (const category of categories) {
            await setDoc(doc(db, 'categories', Date.now().toString()), {
                ...category,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        // Create sample e-commerce data
        console.log('Creating sample e-commerce data...');
        
        // Create sample orders (for testing)
        const sampleOrders = [
            {
                orderNumber: 'SM20241201001',
                customerId: 'sample_customer_1',
                customerInfo: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890'
                },
                items: [
                    {
                        productId: 'sample_product_1',
                        productName: 'Sample Product',
                        quantity: 2,
                        price: 29.99
                    }
                ],
                orderStatus: 'pending',
                paymentStatus: 'pending',
                subtotal: 59.98,
                tax: 4.80,
                shipping: 5.99,
                total: 70.77,
                currency: 'USD',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        for (const order of sampleOrders) {
            await setDoc(doc(db, 'orders', Date.now().toString()), order);
        }
        
        // Create sample payments
        const samplePayments = [
            {
                orderId: 'sample_order_1',
                customerId: 'sample_customer_1',
                amount: 70.77,
                currency: 'USD',
                method: 'credit_card',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        for (const payment of samplePayments) {
            await setDoc(doc(db, 'payments', Date.now().toString()), payment);
        }
        
        console.log('Sample e-commerce data created successfully!');
        console.log('Sample data created successfully!');
    } catch (error) {
        console.error('Error creating sample data:', error);
        throw error;
    }
}

/**
 * Main setup function
 */
async function setupFirebase() {
    try {
        console.log('🚀 Starting Firebase setup for Super Mall Web Application...');
        
        // Get admin credentials from user input
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const email = await new Promise((resolve) => {
            rl.question('Enter admin email: ', resolve);
        });
        
        const password = await new Promise((resolve) => {
            rl.question('Enter admin password: ', resolve);
        });
        
        const displayName = await new Promise((resolve) => {
            rl.question('Enter admin display name (optional): ', (name) => {
                resolve(name || 'Admin User');
            });
        });
        
        rl.close();
        
        // Create admin user
        await createAdminUser(email, password, displayName);
        
        // Ask if user wants to create sample data
        const createSample = await new Promise((resolve) => {
            const rl2 = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl2.question('Create sample data? (y/n): ', (answer) => {
                rl2.close();
                resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
            });
        });
        
        if (createSample) {
            await createSampleData();
        }
        
        console.log('✅ Firebase setup completed successfully!');
        console.log('You can now run the application with: npm start');
        
    } catch (error) {
        console.error('❌ Firebase setup failed:', error);
        process.exit(1);
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupFirebase();
}

module.exports = { createAdminUser, createSampleData, setupFirebase };
