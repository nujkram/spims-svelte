import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const { customerId } = params;
    const db = await clientPromise();
    const Customer = db.collection('customers');

    const pipeline = [
        {
            $match: { _id: customerId }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'updatedBy',
                foreignField: '_id',
                as: 'updatedBy'
            }
        },
        {
            $unwind: {
                path: '$updatedBy',
                preserveNullAndEmptyArrays: true
            }
        }
    ];

    const customers = await Customer.find({}).sort({ createdAt: -1 }).toArray();

    const [customer] = await Customer.aggregate(pipeline).toArray();

    return { customer, customers };
}
