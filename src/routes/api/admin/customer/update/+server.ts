import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Customer = db.collection('customers');

	for (const key in data) {
		if (key === '_id') continue;
		if (typeof data[key] === 'string') data[key] = data[key].toUpperCase();
		if (key === 'email') data[key] = data[key].toLowerCase();
	}

	const customerUpdate = {
		$set: {
			updatedAt: new Date(),
			fullName: `${data.firstName} ${data.lastName}`,
			firstName: data.firstName,
			lastName: data.lastName,
			address: data.address,
			phone: data.phone,
			email: data.email,
			tin: data.tin,
			company: data.company,
			isActive: true,
			updatedBy: locals.user._id
		}
	};

	const response = await Customer.updateOne({ _id: data._id }, customerUpdate);

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
