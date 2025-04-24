import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Product = db.collection('products');

	for (const key in data) {
		if (key === '_id') continue;
		if (typeof data[key] === 'string') data[key] = data[key].toUpperCase();
	}

	const productUpdate = {
		$set: {
			updatedAt: new Date(),
			name: data.name,
			category: data.category,
			price: data.price,
			isActive: true,
			business: data.business,
			updatedBy: locals.user._id
		}
	};

	const response = await Product.updateOne({ _id: data._id }, productUpdate);

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
