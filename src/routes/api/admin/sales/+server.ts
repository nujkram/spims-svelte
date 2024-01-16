import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    const db = await clientPromise();
    const Sales = db.collection('sales');
    const Customers = db.collection('customers');
    const Products = db.collection('products');

    const sales = await Sales.find({}).sort({ createdAt: -1 }).toArray();
    const customers = await Customers.find({}).sort({ createdAt: -1 }).toArray();
    const products = await Products.find({}).sort({ createdAt: -1 }).toArray();

    if(sales) {
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
