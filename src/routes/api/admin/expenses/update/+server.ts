import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Expenses = db.collection('expenses');

	const expensesUpdate = {
		$set: {
			updatedAt: new Date(),
			invoice: data.invoice,
			description: data.description,
			name: data.name,
			totalAmount: data.totalAmount,
			cart: data.cart,
			business: data.business,
			updatedBy: locals.user._id
		}
	};

	const response = await Expenses.updateOne({ _id: data._id }, expensesUpdate);

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Data updated successfully',
				response
			})
		);
	}
};
