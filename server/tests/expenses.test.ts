import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { pool } from "../src/db.js";

beforeAll(async () => {
	await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE TABLE IF NOT EXISTS expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      description TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      date DATE NOT NULL
    );
  `);
});

afterAll(async () => {
	await pool.end();
});

describe("Expenses API", () => {
	it("creates and retrieves an expense", async () => {
		const description = `CI test ${Date.now()}`;

		const created = await request(app).post("/api/expenses").send({
			description,
			amount: 12.5,
			date: "2026-10-26",
		});

		expect(created.status).toBe(201);
		expect(created.body.description).toBe(description);

		const response = await request(app).get("/api/expenses");

		expect(response.status).toBe(200);
		expect(
			response.body.some(
				(expense: { description: string }) =>
					expense.description === description,
			),
		).toBe(true);
	});

	it("rejects invalid expenses", async () => {
		const response = await request(app)
			.post("/api/expenses")
			.send({ description: "" });

		expect(response.status).toBe(400);
	});
});
