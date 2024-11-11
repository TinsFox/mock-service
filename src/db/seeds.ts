import { dbClient } from "./client.node"
import {
  Album,
  albums,
  Task,
  tasks,
  TeamUser,
  teamUsers,
  users,
} from "./schema"
import {
  generateRandomTask,
  generateRandomTeamUser,
  generateRandomUser,
  generateRandomAlbum,
} from "./utils"
import { User } from "./schema"
import { hashPassword } from "../lib/crypto"
import { faker } from "@faker-js/faker"

export async function seedAdminUser() {
  const adminUser = [
    {
      email: "admin@shadcn.com",
      username: "admin",
      name: "Admin",
      avatar: faker.image.avatarGitHub(),
      birthdate: faker.date.birthdate().toISOString(),
      bio: faker.lorem.paragraph(),
      password: hashPassword("admin"),
    },
    {
      email: "user@shadcn.com",
      username: "user",
      name: "User",
      avatar: faker.image.avatarGitHub(),
      birthdate: faker.date.birthdate().toISOString(),
      bio: faker.lorem.paragraph(),
      password: hashPassword("user"),
    },
    {
      email: "guest@shadcn.com",
      username: "guest",
      name: "Guest",
      avatar: faker.image.avatarGitHub(),
      birthdate: faker.date.birthdate().toISOString(),
      bio: faker.lorem.paragraph(),
      password: hashPassword("guest"),
    },
  ]
  try {
    console.log("📝 Inserting admin user", adminUser.length)
    await dbClient.insert(users).values(adminUser)
  } catch (err) {
    console.error(err)
  }
}

export async function seedTeams(input: { count: number }) {
  const count = input.count ?? 100

  try {
    const allTeams: TeamUser[] = []

    for (let i = 0; i < count; i++) {
      allTeams.push(generateRandomTeamUser())
    }

    await dbClient.delete(teamUsers)

    console.log("📝 Inserting teams", allTeams.length)

    await dbClient.insert(teamUsers).values(allTeams).onConflictDoNothing()
  } catch (err) {
    console.error(err)
  }
}
export async function seedTasks(input: { count: number }) {
  const count = input.count ?? 100

  try {
    const allTasks: Task[] = []

    for (let i = 0; i < count; i++) {
      allTasks.push(generateRandomTask())
    }

    await dbClient.delete(tasks)

    console.log("📝 Inserting tasks", allTasks.length)

    await dbClient.insert(tasks).values(allTasks).onConflictDoNothing()
  } catch (err) {
    console.error(err)
  }
}

export async function seedAlbums(input: { count: number }) {
  const count = input.count ?? 100

  try {
    const allAlbums: Album[] = []

    for (let i = 0; i < count; i++) {
      allAlbums.push(generateRandomAlbum())
    }

    await dbClient.delete(albums)

    console.log("📝 Inserting albums", allAlbums.length)

    await dbClient.insert(albums).values(allAlbums).onConflictDoNothing()
  } catch (err) {
    console.error(err)
  }
}
