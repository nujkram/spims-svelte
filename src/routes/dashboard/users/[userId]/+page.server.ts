import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const {userId} = params;
    const db = await clientPromise();
    const Users = db.collection('users');

    const pipeline = [
      {
        $match: { _id: userId }
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
      }
    ];
    
    const [user] = await Users.aggregate(pipeline).toArray();
    console.log(user);
    return {user};
}
