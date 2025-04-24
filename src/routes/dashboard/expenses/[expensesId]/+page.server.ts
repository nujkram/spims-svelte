import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { expensesId } = params;
	const db = await clientPromise();
	const Expenses = db.collection('expenses');

	const pipeline = [
		{
			$match: {
				_id: expensesId
			}
		},
		{
			$lookup: {
				from: 'users',
				localField: 'createdBy',
				foreignField: '_id',
				as: 'createdBy'
			}
		},
		{
			$lookup: {
				from: 'users',
				localField: 'updatedBy',
				foreignField: '_id',
				as: 'updatedBy'
			}
		},
		{
			$unwind: {
				path: '$createdBy',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$unwind: {
				path: '$updatedBy',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$sort: { createdAt: -1 }
		}
	];

	const [expenses] = await Expenses.aggregate(pipeline).toArray();

	return { expenses };
}
