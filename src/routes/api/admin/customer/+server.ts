import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }: any) {
    const db = await clientPromise();
    const Customers = db.collection('customers');

    const response = await Customers.find({}).sort({ createdAt: -1 }).toArray();

    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response
            })
        )
    }
}
