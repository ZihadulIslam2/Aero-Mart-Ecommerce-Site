const Order = require('../../models/Order')
const Cart = require('../../models/Cart')
const Product = require('../../models/Product')

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: 'http://localhost:5173/shop/paypal-return',
        cancel_url: 'http://localhost:5173/shop/paypal-cancel',
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: 'USD',
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: 'USD',
            total: totalAmount.toFixed(2),
          },
          description: 'description',
        },
      ],
    }

    // paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
    //   if (error) {
    //     console.log(error);

    //     return res.status(500).json({
    //       success: false,
    //       message: "Error while creating paypal payment",
    //     });
    //   } else {
    //     const newlyCreatedOrder = new Order({
    //       userId,
    //       cartId,
    //       cartItems,
    //       addressInfo,
    //       orderStatus,
    //       paymentMethod,
    //       paymentStatus,
    //       totalAmount,
    //       orderDate,
    //       orderUpdateDate,
    //       paymentId,
    //       payerId,
    //     });

    //     await newlyCreatedOrder.save();

    //     const approvalURL = paymentInfo.links.find(
    //       (link) => link.rel === "approval_url"
    //     ).href;

    //     res.status(201).json({
    //       success: true,
    //       approvalURL,
    //       orderId: newlyCreatedOrder._id,
    //     });
    //   }
    // });
  } catch (e) {
    console.log(e)
    res.status(500).json({
      success: false,
      message: 'Some error occured!',
    })
  }
}

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body

    let order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order can not be found',
      })
    }

    order.paymentStatus = 'paid'
    order.orderStatus = 'confirmed'
    order.paymentId = paymentId
    order.payerId = payerId

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId)

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        })
      }

      product.totalStock -= item.quantity

      await product.save()
    }

    const getCartId = order.cartId
    await Cart.findByIdAndDelete(getCartId)

    await order.save()

    res.status(200).json({
      success: true,
      message: 'Order confirmed',
      data: order,
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      success: false,
      message: 'Some error occured!',
    })
  }
}

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required',
      })
    }

    console.log('Fetching orders for userId:', userId)
    const orders = await Order.find({ userId })
    console.log('Found orders:', orders.length)

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message:
          'No orders yet. Complete a purchase to see your order history.',
      })
    }

    res.status(200).json({
      success: true,
      data: orders,
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      success: false,
      message: 'Some error occured!',
    })
  }
}

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found!',
      })
    }

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      success: false,
      message: 'Some error occured!',
    })
  }
}

const createTestOrder = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required',
      })
    }

    const testOrder = await Order.create({
      userId,
      cartItems: [
        {
          productId: 'test-product-1',
          title: 'Test Product',
          price: '99.99',
          quantity: 1,
        },
      ],
      addressInfo: {
        address: '123 Test Street',
        city: 'Test City',
        pincode: '12345',
        phone: '1234567890',
      },
      orderStatus: 'placed',
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      totalAmount: 99.99,
      orderDate: new Date(),
    })

    res.status(201).json({
      success: true,
      message: 'Test order created successfully',
      data: testOrder,
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      success: false,
      message: 'Error creating test order',
    })
  }
}

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  createTestOrder,
}
