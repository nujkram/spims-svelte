import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const load = async () => {
	const db = await clientPromise();
	const Sales = db.collection('sales');
	const Products = db.collection('products');

	// get start and end of the previous month
	const start = new Date();
	start.setDate(1);
	start.setMonth(start.getMonth() - 1);
	start.setHours(0, 0, 0, 0);
	const end = new Date();
	end.setHours(23, 59, 59, 999);
	const pipeline = [
		{
			$match: {
				isActive: true,
				createdAt: {
					$gte: start,
					$lt: end
				}
			}
		},
		{
			$lookup: {
				from: 'customers',
				localField: 'customerId',
				foreignField: '_id',
				as: 'customer'
			}
		},
		{
			$unwind: {
				path: '$customer',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$sort: { createdAt: 1 }
		}
	];

	const sales = await Sales.aggregate(pipeline).toArray();

	// Add totalPayment to sales
	sales.map((item) => {
		if (item.payments) {
			item.totalPayment = item.payments.reduce(
				(acc, curr) => parseFloat(acc) + parseFloat(curr.amount),
				0
			);
		} else {
			item.totalPayment = 0;
		}
		item.balance =
			parseFloat(item.amount) - (parseFloat(item.downpayment) + parseFloat(item.totalPayment));
	});

	return {
		sales
	};
};
