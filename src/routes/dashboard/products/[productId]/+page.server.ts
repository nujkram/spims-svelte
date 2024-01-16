import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const { productId } = params;
    const db = await clientPromise();
    const Product = db.collection('products');

    const pipeline = [
        {
            $match: { _id: productId }
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

    const products = await Product.find({}).sort({ createdAt: -1 }).toArray();

    const [product] = await Product.aggregate(pipeline).toArray();

    return { product, products };
}
