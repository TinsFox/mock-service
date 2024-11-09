import { seedAdminUser, seedAlbums, seedTasks, seedTeams } from "./seeds"

async function runSeed() {
  console.log("⏳ Running seed...")

  const start = Date.now()

  await seedAdminUser()
  await seedTasks({ count: 100 })
  await seedTeams({ count: 100 })
  await seedAlbums({ count: 100 })
  const end = Date.now()

  console.log(`✅ Seed completed in ${end - start}ms`)

  process.exit(0)
}

runSeed().catch((err) => {
  console.error("❌ Seed failed")
  console.error(err)
  process.exit(1)
})
