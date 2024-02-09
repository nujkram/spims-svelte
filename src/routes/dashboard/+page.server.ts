import clientPromise from '$lib/server/mongo';
import dateToString from '$lib/utils/dateHelper';

/** @type {import('./$types').RequestHandler} */
export const load = async ({locals}: {locals: unknown}) => {

    const { user }: any = locals;

    const db = await clientPromise();
    const Sales = db.collection('sales');
    const Customers = db.collection('customers');
    const Products = db.collection('products');
    const Expenses = db.collection('expenses');
    const Users = db.collection('users');

    const customers = await Customers.find({}).sort({ createdAt: 1 }).toArray();
    const products = await Products.find({}).sort({ createdAt: 1 }).toArray();
    const expenses = await Expenses.find({}).sort({ createdAt: 1 }).toArray();
    const users = await Users.find({}).sort({ createdAt: 1 }).toArray();

    const pipeline = [
        {
            $match: {
                isActive: true,
            }
        },
        {
            $lookup: {
                from: 'customers',
                localField: 'customerId',
                foreignField: '_id',
                as: 'customer'
            },
        },
        {
            $lookup: {
                'from': 'users',
                'localField': 'createdBy',
                'foreignField': '_id',
                'as': 'createdBy'
            },
        },
        {
            $lookup: {
                'from': 'users',
                'localField': 'updatedBy',
                'foreignField': '_id',
                'as': 'updatedBy'
            },
        },
        {
            $unwind: {
                path: '$customer',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: '$updatedBy',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $sort: { createdAt: 1 }
        }
    ]

    const sales = await Sales.aggregate(pipeline).toArray();

    // Add totalPayment to sales
    sales.map((item) => {
        if (item.payments) {
            item.totalPayment = item.payments.reduce((acc, curr) => parseFloat(acc) + parseFloat(curr.amount), 0);
        } else {
            item.totalPayment = 0;
        }
        item.balance = parseFloat(item.amount) - (parseFloat(item.downpayment) + parseFloat(item.totalPayment));

    })

    const salesSummary = await Sales.aggregate([
        {
            $match: {
                isActive: true,
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalAmount: { $sum: "$amount" },
                totalDownpayment: { $sum: "$downpayment" },
                totalPayments: {
                    $sum: {
                        $cond: {
                            if: { $isArray: "$payments" },
                            then: {
                                $sum: {
                                    $map: {
                                        input: "$payments",
                                        as: "payment",
                                        in: { $toDouble: "$$payment.amount" }
                                    }
                                }
                            },
                            else: 0
                        }
                    }
                },
            }
        },
        {
            $addFields: {
                totalBalance: {
                    $subtract: [
                        "$totalAmount",
                        {
                            $add: [
                                "$totalDownpayment",
                                "$totalPayments"
                            ]
                        }
                    ]
                }
            }
        },            
        {
            $sort: { _id: 1 }
        }
    ]).toArray();

    const expensesSummary = await Expenses.aggregate([
        {
            $match: {
                isActive: true,
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalExpenses: { $sum: "$totalAmount" },
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
        expensesSummary
    }
}
