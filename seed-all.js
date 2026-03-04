const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);
    const users = [
        { email: 'csc@mmnagar', name: 'CSC MM Nagar' },
        { email: 'csc@srivarshan', name: 'CSC Srivarshan' },
        { email: 'gingee@csc.com', name: 'CSC Gingee' }
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                password,
                role: u.role || 'ADMIN',
            },
        });
    }
    console.log('Users seeded successfully');
}

main().finally(() => prisma.$disconnect());
