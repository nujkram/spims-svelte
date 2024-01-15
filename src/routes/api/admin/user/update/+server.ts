import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	const data = await request.json();
	const db = await clientPromise();
	const User = db.collection('users');
	
    const userUpdate = {
        $set: {
            updatedAt: new Date(),
            fullName: `${data.firstName} ${data.lastName}`,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            isActive: true,
            role: data.role,
            updatedBy: locals.user._id
        }
    }

    const response = await User.updateOne({ _id: data._id }, userUpdate);

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
