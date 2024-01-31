import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';
import { stringToDecimal } from '$lib/utils/currencyHelper';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
    const data = await request.json();
    const db = await clientPromise();
    const Sales = db.collection('sales');

    for (const key in data) {
        if (key === '_id') continue;
        if (typeof data[key] === 'string') data[key] = data[key].toUpperCase();
    }

    const salesUpdate = {
        $push: {
            payments: {
              amount: stringToDecimal(data?.amount || 0),
              paymentMethod: data.paymentMethod,  
              createdBy: locals.user._id,
              createdAt: new Date()
            }
          },
        $set: {
            updatedAt: new Date(),
            updatedBy: locals.user._id
        }
    }

    const response = await Sales.updateOne({ _id: data._id }, salesUpdate);

    if (response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                message: 'Payment added successfully',
                response
            })
        );
    }
}
