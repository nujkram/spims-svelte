import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
    const data = await request.json();
    // const db = await clientPromise();
    // const Sales = db.collection('sales');

    data._id = id();
    data.createdAt = new Date();
    data.createdBy = locals.user._id;
    data.updatedBy = locals.user._id;

    if (data) {
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Customer added successfully',
                data: data
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
                message: 'Failed to add customer',
                data: response
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }
    // const response = await Sales.insertOne(data);
    // if (response) {
    //     return new Response(
    //         JSON.stringify({
    //             success: true,
    //             message: 'Customer added successfully',
    //             data: response
    //         }),
    //         {
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         }
    //     )
    // } else {
    //     return new Response(
    //         JSON.stringify({
    //             success: false,
    //             message: 'Failed to add customer',
    //             data: response
    //         }),
    //         {
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         }
    //     )
    // }
}
