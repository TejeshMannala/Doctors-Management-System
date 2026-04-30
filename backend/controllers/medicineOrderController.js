const MedicineOrder = require('../models/MedicineOrder');

exports.createOrder = async (req, res) => {
  try {
    const { prescriptionId, address, medicines } = req.body;
    const patientId = req.user.id;

    const newOrder = new MedicineOrder({
      patientId,
      prescriptionId,
      medicines,
      address,
      status: 'Pending'
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Error creating order' });
  }
};

exports.getPatientOrders = async (req, res) => {
  try {
    const patientId = req.user.id;
    const orders = await MedicineOrder.find({ patientId }).populate('prescriptionId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Get patient orders error:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await MedicineOrder.find()
      .populate('patientId', 'fullName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await MedicineOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
};
