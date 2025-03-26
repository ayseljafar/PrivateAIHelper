import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  techStack: text("tech_stack").array(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  environment: text("environment").notNull(),
  status: text("status").notNull(),
  logs: text("logs"),
  deployedAt: timestamp("deployed_at").defaultNow(),
  deployedBy: text("deployed_by"),
});

export const environments = pgTable("environments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config"),
  status: text("status").notNull(),
  lastDeployed: timestamp("last_deployed"),
});

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config"),
  status: text("status").notNull(),
  lastUsed: timestamp("last_used"),
  requestCount: integer("request_count").default(0),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

export const approvals = pgTable("approvals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  type: true,
  description: true,
  techStack: true,
  userId: true,
});

export const insertDeploymentSchema = createInsertSchema(deployments).pick({
  projectId: true,
  environment: true,
  status: true,
  logs: true,
  deployedBy: true,
});

export const insertEnvironmentSchema = createInsertSchema(environments).pick({
  name: true,
  type: true,
  config: true,
  status: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  name: true,
  type: true,
  config: true,
  status: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  description: true,
  projectId: true,
  metadata: true,
});

export const insertApprovalSchema = createInsertSchema(approvals).pick({
  title: true,
  description: true,
  type: true,
  priority: true,
  status: true,
  metadata: true,
});

export const insertLogSchema = createInsertSchema(logs).pick({
  type: true,
  message: true,
  metadata: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Deployment = typeof deployments.$inferSelect;
export type Environment = typeof environments.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Approval = typeof approvals.$inferSelect;
export type Log = typeof logs.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type InsertEnvironment = z.infer<typeof insertEnvironmentSchema>;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type InsertLog = z.infer<typeof insertLogSchema>;
