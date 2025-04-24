import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const load = async () => {
	const db = await clientPromise();
	const Expenses = db.collection('expenses');

	const expenses = await Expenses.find({}).sort({ createdAt: 1 }).toArray();

	return {
		expenses
	};
};
