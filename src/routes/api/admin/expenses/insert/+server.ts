import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Expenses = db.collection('expenses');

	for (const key in data) {
		if (typeof data[key] === 'string') data[key] = data[key].toUpperCase();
		if (key === 'email') data[key] = data[key].toLowerCase();
	}

	data._id = id();
	data.amount = data.amount ? parseFloat(data.amount) : 0;
	data.isActive = true;
	data.createdAt = new Date();
	data.updatedAt = new Date();
	data.createdBy = locals.user._id;
	data.updatedBy = locals.user._id;

	if (data) {
		const response = await Expenses.insertOne(data);
		return new Response(
			JSON.stringify({
				success: true,
				message: 'Sales order added successfully',
				response
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} else {
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Failed to add sales order',
				response: data
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
