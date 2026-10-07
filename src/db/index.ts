import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from 'dotenv'
import * as schema from './schema'

config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não definida no .env.local')
}

const client = postgres(connectionString, {
  prepare: false,
})

export const db = drizzle(client, { schema })