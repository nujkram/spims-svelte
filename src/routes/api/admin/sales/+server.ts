import clientPromise from '$lib/server/mongo';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url }) => {
	try {
		const db = await clientPromise();
		const Sales = db.collection('sales');
		const Customers = db.collection('customers');
		const Products = db.collection('products');

		// Get year from query params, default to current year
		const yearParam = url.searchParams.get('year');
		const year = parseInt(yearParam || new Date().getFullYear().toString());

		// Calculate start and end of the target year
		const startOfYear = new Date(year, 0, 1);
		const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

		const salesPipeline = [
			{
				$match: {
					isActive: true,
					// Add date filtering to the main match stage
					createdAt: {
						$gte: startOfYear,
						$lte: endOfYear
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
				$addFields: {
					totalPayment: {
						$ifNull: [
							{
								$reduce: {
									input: '$payments',
									initialValue: 0,
									in: { $add: ['$$value', { $toDouble: '$$this.amount' }] }
								}
							},
							0 // Default value if payments is null or missing
						]
					}
				}
			},
			{
				$addFields: {
					balance: {
						$subtract: [
							{ $toDouble: '$amount' },
							{ $add: [{ $toDouble: '$downpayment' }, '$totalPayment'] }
						]
					}
				}
			},
			{
				$sort: { createdAt: -1 } // Often more useful to sort recent first
			}
		];

		// Fetch related data (consider if these also need filtering or if fetching all is okay)
		const customers = await Customers.find({}).toArray();
		const products = await Products.find({}).toArray();
		const sales = await Sales.aggregate(salesPipeline).toArray();

		const response = {
			sales,
			customers,
			products
		};

		return json({ response });
	} catch (err) {
		return json({ error: 'Failed to fetch sales data.' }, { status: 500 });
	}
};
