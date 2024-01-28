import clientPromise from '$lib/server/mongo';
import dateToString from '$lib/utils/dateHelper';

/** @type {import('./$types').RequestHandler} */
export const load = async () => {
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

    return {
        sales,
        customers,
        expenses,
        products,
        users
    }
}
