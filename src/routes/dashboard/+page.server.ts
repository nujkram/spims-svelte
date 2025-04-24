import clientPromise from '$lib/server/mongo';
import type { RequestHandler, PageServerLoad } from './$types';

interface Payment {
	amount: string;
	[key: string]: any;
}

interface Sale {
	_id: string;
	amount: string;
	downpayment: string;
	payments?: Payment[];
	totalPayment?: number;
	balance?: number;
	[key: string]: any;
}

interface SummaryItem {
	_id: string;
	totalAmount: number;
	totalDownpayment: number;
	totalPayments: number;
	totalBalance: number;
}

/** @type {import('./$types').RequestHandler} */
export const load: PageServerLoad = async ({ url, locals }) => {
	const { user } = locals as { user: any };
	const yearParam = url.searchParams.get('year');
	const year = parseInt(yearParam || new Date().getFullYear().toString());

	const db = await clientPromise();
	const Sales = db.collection('sales');
	const Customers = db.collection('customers');
	const Products = db.collection('products');
	const Expenses = db.collection('expenses');
	const Users = db.collection('users');

	const startOfYear = new Date(year, 0, 1);
	const endOfYear = new Date(year, 11, 31, 23, 59, 59);

	const customers = await Customers.find({}).sort({ createdAt: 1 }).toArray();
	const products = await Products.find({}).sort({ createdAt: 1 }).toArray();
	const expenses = await Expenses.find({}).sort({ createdAt: 1 }).toArray();
	const users = await Users.find({}).sort({ createdAt: 1 }).toArray();

	const pipeline = [
		{
			$match: {
				isActive: true,
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
			$lookup: {
				from: 'users',
				localField: 'createdBy',
				foreignField: '_id',
				as: 'createdBy'
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
				path: '$customer',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$unwind: {
				path: '$createdBy',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$unwind: {
				path: '$updatedBy',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$sort: { createdAt: 1 }
		}
	];

	const sales = (await Sales.aggregate(pipeline).toArray()) as Sale[];

	sales.forEach((item: Sale) => {
		if (item.payments) {
			item.totalPayment = item.payments.reduce(
				(acc: number, curr: Payment) => acc + parseFloat(curr.amount),
				0
			);
		} else {
			item.totalPayment = 0;
		}
		item.balance = parseFloat(item.amount) - (parseFloat(item.downpayment) + item.totalPayment);
	});

	const salesSummary = (await Sales.aggregate([
		{
			$match: {
				isActive: true,
				createdAt: {
					$gte: startOfYear,
					$lte: endOfYear
				}
			}
		},
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				totalAmount: { $sum: '$amount' },
				totalDownpayment: { $sum: '$downpayment' },
				totalPayments: {
					$sum: {
						$cond: {
							if: { $isArray: '$payments' },
							then: {
								$sum: {
									$map: {
										input: '$payments',
										as: 'payment',
										in: { $toDouble: '$$payment.amount' }
									}
								}
							},
							else: 0
						}
					}
				}
			}
		},
		{
			$addFields: {
				totalBalance: {
					$subtract: [
						'$totalAmount',
						{
							$add: ['$totalDownpayment', '$totalPayments']
						}
					]
				}
			}
		},
		{
			$sort: { _id: 1 }
		}
	]).toArray()) as SummaryItem[];

	const expensesSummary = await Expenses.aggregate([
		{
			$match: {
				isActive: true,
				createdAt: {
					$gte: startOfYear,
					$lte: endOfYear
				}
			}
		},
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				totalExpenses: { $sum: '$totalAmount' }
			}
		}
	]).toArray();

	return {
		user,
		sales,
		customers,
		expenses,
		products,
		users,
		salesSummary,
		expensesSummary,
		currentYear: year
	};
};
