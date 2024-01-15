import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: unknown) {
    const data = await request.json();
    const db = await clientPromise();
    const Customer = db.collection('customers');

    data._id = id();
    data.fullName = `${data.firstName} ${data.lastName}`;
    data.createdAt = new Date();
    data.createdBy = locals.user._id;
    data.updatedBy = locals.user._id;

    const response = await Customer.insertOne(data);
    if (response) {
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Customer added successfully',
                data: response
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    } else {
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to add customer',
                data: response
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }
}
