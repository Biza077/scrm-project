const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.productionMetric.updateMany({
    where: { year: 2024 },
    data: { year: 2026 },
  });
  console.log(`Updated ${result.count} records to year 2026.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
