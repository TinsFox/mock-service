import { faker } from "@faker-js/faker"

import { Task, User, Album, TeamUser, Role, Permission } from "./schema"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons"

export function generateRandomTask(): Task {
  return {
    id: faker.string.uuid(),
    title: faker.hacker.phrase(),
    status: faker.helpers.arrayElement(statuses).value,
    label: faker.helpers.arrayElement(labels).value,
    priority: faker.helpers.arrayElement(priorities).value,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function generateRandomUser(): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
    birthdate: faker.date.birthdate().toISOString(),
    bio: faker.lorem.paragraph(),
    password: faker.internet.password(),
    registeredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function generateRandomAlbum(): Album {
  return {
    id: faker.string.uuid(),
    title: faker.music.songName(),
    cover: faker.image.url(),
    url: faker.internet.url(),
    slogan: faker.company.catchPhrase(),
    digitalDownloads: faker.number.int({ min: 0, max: 1000000 }).toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function generateRandomTeamUser(): TeamUser {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    status: faker.helpers.arrayElement(["active", "inactive", "busy"]),
    role: faker.helpers.arrayElement(["admin", "member", "guest"]),
    bio: faker.lorem.paragraph(),
    amount: faker.number.int({ min: 0, max: 10000 }).toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function generateRandomRole(): Role {
  return {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(["Admin", "Editor", "Viewer", "Manager"]),
    description: faker.lorem.sentence(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function generateRandomPermission(): Permission {
  return {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement([
      "read:users",
      "write:users",
      "delete:users",
      "manage:content",
      "view:dashboard",
    ]),
    description: faker.lorem.sentence(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "todo",
    label: "Todo",
    icon: CircleIcon,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: StopwatchIcon,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircledIcon,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CrossCircledIcon,
  },
]

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
]
