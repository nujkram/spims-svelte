import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
    const data = await request.json();
    const db = await clientPromise();
    const Customers = db.collection('customers');
    const Sales = db.collection('sales');

    data.customer = data.customer ? data.customer.toUpperCase() : '';

    // if no customer found create one
    if (!data?.customerId) {
        const newCustomer = {
            _id: id(),
            createdAt: new Date(),
            createdBy: locals.user._id,
            updatedBy: locals.user._id,
            isActive: true,
            fullName: data.customer
        }
        await Customers.insertOne(newCustomer);
        data.customerId = newCustomer._id;
    }

    const salesUpdate = {
        $set: {
            updatedAt: new Date(),
            customerId: data.customerId,
            receipt: data.receipt,
            downpayment: data.downpayment,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            cart: data.cart,
            business: data.business,
            updatedBy: locals.user._id
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
