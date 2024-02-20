import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
    const data = await request.json();
    const db = await clientPromise();
    const Sales = db.collection('sales');
    const paymentIndex: number = data.paymentIndex;
    data.isDeleted = true;
    data.deletedAt = new Date();
    data.isActive = false;
    data.deletedBy = locals.user._id;

    const removePayment = await Sales.updateOne(
        { _id: data._id },
        { $unset: { [`payments.${paymentIndex}`]: 1 } }
    );

    if (removePayment.modifiedCount === 1) {
        const response = await Sales.updateOne(
            { _id: data._id },
            { $pull: { payments: null } }
        );
        if (response) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Sales delete successfully',
                    data: response
                }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
        } else {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Failed to delete sales',
                    data: response
                }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
        }
    } else {
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to remove null payments from the array.',
                data: removePayment
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }




    // const response = await Sales.updateOne({ _id: data._id }, { $set: data });
    // const response = await Sales.deleteOne({ _id: data._id });
    // update Sales by data._id and remove payments with array index paymentIndex


}
