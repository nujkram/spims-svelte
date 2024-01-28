import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
    const db = await clientPromise();
    const Expenses = db.collection('expenses');

    const response = await Expenses.find({ isActive: true}).sort({ createdAt: -1 }).toArray();

    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response
            })
        )
    }
}
