import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Customers = db.collection('customers');
	const Sales = db.collection('sales');

	data.customer = data.customer ? data.customer.toUpperCase() : '';

	// if no customer found create one
	if (!data?.customerId) {
		const newCustomer = {
			_id: id(),
			createdAt: new Date(),
			createdBy: locals.user._id,
			updatedBy: locals.user._id,
			isActive: true,
			fullName: data.customer
		};
		await Customers.insertOne(newCustomer);
		data.customerId = newCustomer._id;
	}

	data._id = id();
	data.isActive = true;
	data.createdAt = new Date();
	data.updatedAt = new Date();
	data.createdBy = locals.user._id;
	data.updatedBy = locals.user._id;

	if (data) {
		const response = await Sales.insertOne(data);
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
