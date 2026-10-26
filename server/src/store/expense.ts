import { pool } from "../db.js";
import type { Expense, NewExpense } from "../types/expense.js";

export async function getExpenses(): Promise<Expense[]> {
	const result = await pool.query<Expense>(
		"SELECT id, description, amount, date FROM expenses ORDER BY date DESC",
	);
	return result.rows;
}

export async function addExpense(newExpense: NewExpense): Promise<Expense> {
	const result = await pool.query<Expense>(
		`INSERT INTO expenses (description, amount, date)
                 VALUES ($1, $2, $3)
                 RETURNING id, description, amount, date`,
		[newExpense.description, newExpense.amount, newExpense.date],
	);
	return result.rows[0];
}

export async function getExpense(id: string): Promise<Expense | null> {
	const result = await pool.query<Expense>(
		"SELECT id, description, amount, date FROM expenses WHERE id = $1",
		[id],
	);
	return result.rows[0] ?? null;
}

export async function updateExpense(
	id: string,
	update: NewExpense,
): Promise<Expense | null> {
	const result = await pool.query<Expense>(
		`UPDATE expenses
                 SET description = $1, amount = $2, date = $3
                 WHERE id = $4
                 RETURNING id, description, amount, date`,
		[update.description, update.amount, update.date, id],
	);
	return result.rows[0] ?? null;
}

export async function deleteExpense(id: string): Promise<boolean> {
	const result = await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
	return (result.rowCount ?? 0) > 0;
}
