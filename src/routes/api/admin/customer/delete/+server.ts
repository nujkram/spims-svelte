import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Customer = db.collection('customers');

	data.isDeleted = true;
	data.deletedAt = new Date();
	data.isActive = false;
	data.deletedBy = locals.user._id;

	const response = await Customer.updateOne({ _id: data._id }, { $set: data });

	if (response) {
		return new Response(
			JSON.stringify({
				success: true,
				message: 'Customer delete successfully',
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
				message: 'Failed to delete customer',
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
