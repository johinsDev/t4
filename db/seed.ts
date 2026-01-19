import { db } from "./index"
import { users } from "./schema"

async function seed() {
	// biome-ignore lint/suspicious/noConsole: CLI script output
	console.log("Seeding database...")

	// Clear existing data
	await db.delete(users)

	// Insert seed data
	await db.insert(users).values([
		{
			id: crypto.randomUUID(),
			name: "Admin User",
			email: "admin@example.com",
		},
		{
			id: crypto.randomUUID(),
			name: "Test User",
			email: "test@example.com",
		},
	])

	// biome-ignore lint/suspicious/noConsole: CLI script output
	console.log("Seeding complete!")
}

seed().catch((error) => {
	console.error("Seeding failed:", error)
	process.exit(1)
})
