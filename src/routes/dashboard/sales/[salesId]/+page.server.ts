import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const { salesId } = params;
    const db = await clientPromise();
    const Sales = db.collection('sales');

    const pipeline = [
        {
            $match: {
                _id: salesId
            }
        },
        {
            $lookup: {
                from: 'customers',
                localField: 'customerId',
                foreignField: '_id',
                as: 'customer'
            },
        },
        {
            $lookup: {
                'from': 'users',
                'localField': 'createdBy',
                'foreignField': '_id',
                'as': 'createdBy'
            },
        },
        {
            $lookup: {
                'from': 'users',
                'localField': 'updatedBy',
                'foreignField': '_id',
                'as': 'updatedBy'
            },
        },
        {
            $unwind: {
                path: '$customer',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: '$updatedBy',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $sort: { createdAt: -1 }
        }
    ]


    const [sales] = await Sales.aggregate(pipeline).toArray();

    // Add totalPayment to sales
    sales.totalPayment = sales.payments.reduce((acc, curr) => parseFloat(acc) + parseFloat(curr.amount), 0);


    return { sales };
}
