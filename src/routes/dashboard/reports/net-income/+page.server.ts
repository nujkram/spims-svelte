import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const load = async () => {
    const db = await clientPromise();
    const Sales = db.collection('sales');
    const Products = db.collection('products');
    const Expenses = db.collection('expenses');

    // get start and end of the previous month
    const start = new Date();
    start.setDate(1);
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
  
    const salesSummary = await Sales.aggregate([
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
                createdAt: {
                    $gte: start,
                    $lt: end
                }
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
        salesSummary,
        expensesSummary
    }
}
