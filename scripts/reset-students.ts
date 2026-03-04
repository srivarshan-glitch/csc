
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("⚠️  Starting Student Data Erasure...");

    try {
        const deleted = await db.student.deleteMany({});
        console.log(`✅ Successfully deleted ${deleted.count} student records (and cascaded related data).`);
    } catch (error) {
        console.error("❌ Error deleting students:", error);
    } finally {
        await db.$disconnect();
    }
}

main();
