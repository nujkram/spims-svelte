import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
    const data = await request.json();
    const db = await clientPromise();
    const Sales = db.collection('sales');

    const index: number = data.index;

    const paymentUpdate = {
        [`payments.${index}`]: {
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            createdBy: data.createdBy,
            createdAt: new Date(data.createdAt),

        }
    };

    const salesUpdate = {
        $set: {
            updatedAt: new Date(),
            updatedBy: locals.user._id,
            ...paymentUpdate

        }
    }

    const response = await Sales.updateOne({ _id: data._id }, salesUpdate);

    if (response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                message: 'Data updated successfully',
                response
            })
        );
    }
}
