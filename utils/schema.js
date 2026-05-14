/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary
 *
 * SCHEMA CHANGES vs previous version:
 *   UserAnswer — added `videoUrl` and `videoPublicId` columns to support
 *   video recording storage and clean Cloudinary deletion after review.
 *
 * After updating this file run ONE of the following in your terminal:
 *   npm run db:push        ← if you use drizzle-kit push (no migration files)
 *   npm run db:generate    ← if you track migration SQL files
 *   then: npm run db:migrate
 */

import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const mockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('jsonMockResp').notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: varchar('createdAt'),
    mockId: varchar('mockId').notNull()
});

export const UserAnswer = pgTable('userAnswer', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId').notNull(),
    question: varchar('question').notNull(),
    correctAns: text('correctAns'),
    userAns: text('userAns'),
    feedback: text('feedback'),         // AI-generated feedback
    rating: varchar('rating'),
    userEmail: varchar('userEmail'),
    createdAt: varchar('createdAt'),

    // ── Human-in-the-Loop fields ─────────────────────────────────────────
    humanFeedback: text('humanFeedback'),           // Coach's written notes
    status: varchar('status').default('pending'),   // pending → reviewed

    // ── Video recording fields ────────────────────────────────────────────
    // videoUrl      : full Cloudinary HTTPS URL — used by the operator to play the recording
    // videoPublicId : Cloudinary public_id — used to delete the video after review
    //                 stored separately so deletion never requires URL parsing
    videoUrl: text('videoUrl'),
    videoPublicId: varchar('videoPublicId'),
});