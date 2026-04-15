/** @type { import {"drizzle-kit"}.Config; */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.js",
  dbCredentials: { 
    url: 'postgresql://neondb_owner:npg_6RqEJxLIdHo0@ep-falling-darkness-addo7zyj-pooler.c-2.us-east-1.aws.neon.tech/GenView?sslmode=require&channel_binding=require'
  }
});
 