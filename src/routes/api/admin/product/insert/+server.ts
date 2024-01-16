import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: unknown) {
    const data = await request.json();
    const db = await clientPromise();
    const Product = db.collection('products');

    for (const key in data) {
        if (typeof data[key] === 'string') data[key] = data[key].toUpperCase();
    }

    data._id = id();
    data.createdAt = new Date();
    data.createdBy = locals.user._id;
    data.updatedBy = locals.user._id;

    const response = await Product.insertOne(data);
    if (response) {
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Product added successfully',
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
