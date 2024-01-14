import { id, hashPassword } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	const data = await request.json();
	const db = await clientPromise();
	const User = db.collection('users');
    data.
	const profile = {
		
	}

	const user = {
		_id: id(),
		createdAt: new Date(),
		updatedAt: new Date(),
		services: {
			password: {
				bcrypt: await hashPassword(data.password)
			},
			resume: {
				loginTokens: []
			}
		},
		emails: [
			{
				address: data.email,
				verified: true
			}
		],
		fullName = `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
		middleName: data.middleName,
		lastName: data.lastName,
		phone: data.phone,
		email: data.email,
		isActive: true,
		isFake: false,
		role: data.role,
	}
	
	const response = await User.insertOne(user);
	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
}
