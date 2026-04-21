import User from "../models/User.js";
import Cake from "../models/Cake.js";
import Accessories from "../models/Accessories.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Delivery from "../models/Delivery.js";

export const getFullReport = async (req, res) => {
    try {
        // Fetch all required data in parallel using aggregation pipelines where useful
        const [users, cakes, accessories, orders, payments, deliveries] = await Promise.all([
            User.aggregate([
                { $match: { role: "user" } },
                { $project: { firstName: 1, lastName: 1, email: 1, createdAt: 1 } },
                { $sort: { createdAt: -1 } }
            ]),
            Cake.aggregate([
                { $project: { name: 1, category: 1, price: 1, quantity: 1 } },
                { $sort: { createdAt: -1 } }
            ]),
            Accessories.aggregate([
                { $project: { name: 1, category: 1, price: 1, quantity: 1 } },
                { $sort: { createdAt: -1 } }
            ]),
            Order.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        orderID: { $toString: "$_id" },
                        customerName: "$customer.name",
                        items: "$items.name",
                        deliveryDate: 1,
                        createdAt: 1,
                        totalPrice: 1,
                        userName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
                        userEmail: "$user.email"
                    }
                },
                { $sort: { createdAt: -1 } }
            ]),
            Payment.aggregate([
                {
                    $project: {
                        transactionID: { $toString: "$_id" },
                        amount: 1,
                        paymentMethod: 1,
                        status: 1,
                        transactionDate: 1
                    }
                },
                { $sort: { createdAt: -1 } }
            ]),
            Delivery.aggregate([
                {
                    $lookup: {
                        from: "drivers",
                        localField: "driverId",
                        foreignField: "_id",
                        as: "driver"
                    }
                },
                { $unwind: { path: "$driver", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        deliveryID: { $toString: "$_id" },
                        orderID: { $toString: "$orderID" },
                        deliveryStatus: 1,
                        createdAt: 1,
                        riderName: { $concat: ["$driver.firstName", " ", "$driver.lastName"] }
                    }
                },
                { $sort: { createdAt: -1 } }
            ])
        ]);

        // Format data for the report
        const report = {
            generatedAt: new Date().toISOString(),
            users: users.map(u => ({
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                registrationDate: new Date(u.createdAt).toLocaleDateString("en-US")
            })),
            products: [
                ...cakes.map(c => ({
                    name: c.name,
                    category: c.category,
                    type: "Cake",
                    price: c.price,
                    stock: c.quantity
                })),
                ...accessories.map(a => ({
                    name: a.name,
                    category: a.category,
                    type: "Accessory",
                    price: a.price,
                    stock: a.quantity
                }))
            ],
            orders: orders.map(o => ({
                orderID: o.orderID.slice(-8).toUpperCase(),
                customerName: o.customerName || o.userName || "N/A",
                items: Array.isArray(o.items) ? o.items.join(", ") : "N/A",
                orderDate: new Date(o.createdAt).toLocaleDateString("en-US"),
                totalPrice: o.totalPrice
            })),
            payments: payments.map(p => ({
                transactionID: p.transactionID.slice(-8).toUpperCase(),
                amount: `LKR ${p.amount.toFixed(2)}`,
                method: p.paymentMethod,
                status: p.status,
                date: new Date(p.transactionDate).toLocaleDateString("en-US")
            })),
            deliveries: deliveries.map(d => ({
                deliveryID: d.deliveryID.slice(-8).toUpperCase(),
                orderID: d.orderID ? d.orderID.slice(-8).toUpperCase() : "N/A",
                rider: d.riderName || "Unassigned",
                status: d.deliveryStatus,
                date: new Date(d.createdAt).toLocaleDateString("en-US")
            }))
        };

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error("Report generation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate report",
            error: error.message
        });
    }
};
