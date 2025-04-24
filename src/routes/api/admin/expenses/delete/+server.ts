import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Expenses = db.collection('expenses');

	data.isDeleted = true;
	data.deletedAt = new Date();
	data.isActive = false;
	data.deletedBy = locals.user._id;

	const response = await Expenses.updateOne({ _id: data._id }, { $set: data });
	// const response = await Expenses.deleteOne({ _id: data._id });

	if (response) {
		return new Response(
			JSON.stringify({
				success: true,
				message: 'Expenses delete successfully',
				data: response
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
				message: 'Failed to delete sales',
				data: response
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
