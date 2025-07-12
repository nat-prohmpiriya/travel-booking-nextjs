import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import adminConfig from '@/utils/adminFirebase';
import admin from 'firebase-admin';

const firestore = admin.firestore();

admin.initializeApp({
  credential: admin.credential.cert(adminConfig as admin.ServiceAccount),
  databaseURL: "https://travel-booking-867f5-default-rtdb.asia-southeast1.firebasedatabase.app"
});



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'failed',
  paymentIntentId: string,
  paymentMethod?: string
): Promise<void> {
  try {
    const bookingRef = admin.firestore().collection('bookings').doc(bookingId);

    // Check if booking exists
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      console.error(`Booking ${bookingId} not found`);
      return;
    }

    const updateData: any = {
      paymentStatus: status,
      paymentIntentId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (status === 'confirmed') {
      updateData.status = 'confirmed';
      updateData.paymentMethod = paymentMethod;
      updateData.confirmedAt = admin.firestore.FieldValue.serverTimestamp();
    } else {
      updateData.status = 'payment_failed';
    }

    await bookingRef.update(updateData);
    console.log(`Booking ${bookingId} updated with status: ${status}`);
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log(`Received event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;

        if (!bookingId) {
          console.error('No bookingId in payment intent metadata');
          break;
        }

        console.log(`Payment succeeded for booking: ${bookingId}`);

        await updateBookingStatus(
          bookingId,
          'confirmed',
          paymentIntent.id,
          paymentIntent.payment_method_types[0]
        );

        // TODO: Send confirmation email to customer
        // TODO: Send notification to hotel
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;

        if (!bookingId) {
          console.error('No bookingId in payment intent metadata');
          break;
        }

        console.log(`Payment failed for booking: ${bookingId}`);

        await updateBookingStatus(
          bookingId,
          'failed',
          paymentIntent.id
        );

        // TODO: Send payment failed notification to customer
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;

        if (!bookingId) {
          console.error('No bookingId in payment intent metadata');
          break;
        }

        console.log(`Payment canceled for booking: ${bookingId}`);

        await updateBookingStatus(
          bookingId,
          'failed',
          paymentIntent.id
        );
        break;
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment requires action: ${paymentIntent.id}`);
        // Handle 3D Secure or other authentication requirements
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`Dispute created: ${dispute.id}`);
        // TODO: Handle dispute created - notify admin
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${invoice.id}`);
        // TODO: Handle failed invoice payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);

    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}