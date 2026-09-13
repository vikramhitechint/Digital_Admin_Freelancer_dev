import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { PaymentType, PaymentStatus, ProjectStatus } from '@prisma/client';

// Razorpay instance will be created dynamically in the functions to ensure env vars are loaded
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key',
  });
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { projectId, paymentType } = req.body;
    
    // Fetch project to get the amount
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
       res.status(404).json({ success: false, error: 'Project not found' });
       return;
    }

    let budget = Number(project.budget);
    let amountToPay = 0;

    if (paymentType === 'ESCROW') {
      amountToPay = budget; // 100%
    } else if (paymentType === 'PENALTY_10') {
      amountToPay = budget * 0.10; // 10%
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment type' });
      return;
    }

    const amount = Math.round(amountToPay * 100); // paise

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${projectId.substring(0, 8)}_${Date.now()}`
    };

    const order = await getRazorpayInstance().orders.create(options);
    
    // Create pending payment in DB
    await prisma.payment.create({
      data: {
        projectId: project.id,
        userId: project.clientId,
        amount: amountToPay,
        type: paymentType as PaymentType,
        status: PaymentStatus.PENDING,
        razorpayOrderId: order.id
      }
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentType
      }
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order', details: error.message || error });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId, paymentType } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key';

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
       res.status(400).json({ success: false, error: 'Invalid signature' });
       return;
    }

    // Find pending payment
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: razorpay_order_id, status: PaymentStatus.PENDING }
    });

    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment record not found or already processed' });
      return;
    }

    // Update payment to completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        razorpayPaymentId: razorpay_payment_id
      }
    });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
       res.status(404).json({ success: false, error: 'Project not found' });
       return;
    }

    let newStatus = project.status;
    let messageContent = "";

    if (paymentType === 'ESCROW') {
      newStatus = ProjectStatus.ONGOING;
      messageContent = "Client has approved the approach and Escrowed 100% of the project budget. Project is now ONGOING.";
      
      // Update wallet balance (+ escrow)
      await prisma.user.update({
        where: { id: project.clientId },
        data: { walletBalance: { increment: payment.amount } }
      });
    } else if (paymentType === 'PENALTY_10') {
      newStatus = ProjectStatus.DROPPED;
      messageContent = "Client has dropped the project and paid the 10% penalty. Project is now DROPPED.";
      
      // Update wallet balance (+ penalty)
      await prisma.user.update({
        where: { id: project.clientId },
        data: { walletBalance: { increment: payment.amount } }
      });
    }

    // Update project status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus }
    });

    if (messageContent) {
      await prisma.message.create({
        data: {
          content: messageContent,
          projectId: updatedProject.id,
          senderId: project.clientId 
        }
      });
    }

    res.json({ success: true, message: 'Payment verified and project status updated', project: updatedProject });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
};
