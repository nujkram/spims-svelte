import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	const db = await clientPromise();
	const Products = db.collection('products');

	const response = await Products.find({}).sort({ createdAt: -1 }).toArray();

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
};
