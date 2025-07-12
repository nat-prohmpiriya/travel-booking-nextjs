import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  bookingId: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentIntentRequest = await request.json();
    
    const {
      amount,
      currency = 'thb',
      bookingId,
      hotelName,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      rooms,
      guests
    } = body;

    // Validate required fields
    if (!amount || !bookingId || !guestEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, bookingId, guestEmail' },
        { status: 400 }
      );
    }

    // Validate amount (minimum 50 THB for Stripe)
    if (amount < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least 50 THB' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (satang)
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId,
        hotelName,
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        rooms: rooms.toString(),
        guests: guests.toString(),
      },
      description: `Hotel booking: ${hotelName}`,
      receipt_email: guestEmail,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Your card was declined.' },
        { status: 400 }
      );
    }
    
    if (error.type === 'StripeRateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests made to the API too quickly.' },
        { status: 429 }
      );
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid parameters were supplied to Stripe\'s API.' },
        { status: 400 }
      );
    }
    
    if (error.type === 'StripeAPIError') {
      return NextResponse.json(
        { error: 'An error occurred internally with Stripe\'s API.' },
        { status: 500 }
      );
    }
    
    if (error.type === 'StripeConnectionError') {
      return NextResponse.json(
        { error: 'Some kind of error occurred during the HTTPS communication.' },
        { status: 500 }
      );
    }
    
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'You probably used an incorrect API key.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}