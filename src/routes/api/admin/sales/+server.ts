import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
    const db = await clientPromise();
    const Sales = db.collection('sales');
    const Customers = db.collection('customers');
    const Products = db.collection('products');

    const customers = await Customers.find({}).sort({ createdAt: -1 }).toArray();
    const products = await Products.find({}).sort({ createdAt: -1 }).toArray();

    const pipeline = [
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

    const sales = await Sales.aggregate(pipeline).toArray();

    if (sales) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response: {
                    sales,
                    customers,
                    products
                }
            })
        )
    }
}
