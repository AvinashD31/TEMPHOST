import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useAuth } from '../../context/AuthContext';
import { useToastStore } from '../../store/useToastStore';
import Loader from '../../components/loader/Loader';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, items } = location.state || {};
  const { user } = useAuth();
  const { clearCart } = useCartStore();
  const { showToast } = useToastStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Log the incoming data
  console.log('Payment component - User:', user);
  console.log('Payment component - Address:', address);

  // Update mergedData to check for both phone and mobile
  const mergedData = {
    ...address,
    phone: user?.phone || user?.mobile || address?.phone || address?.mobile || '', // Check all possible fields
    name: user?.name || ''
  };

  // Log the merged data
  console.log('Payment component - Merged data:', mergedData);
  
  // Update total calculation to include delivery charge
  const subtotal = items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  const total = subtotal + 50; // Assuming a default delivery charge

  const handlePayment = async () => {
    setIsLoading(true);
    if (!items?.length || !address || !user) {
      showToast('Missing required information for payment');
      setIsLoading(false);
      return;
    }

    try {
      setIsProcessing(true);

      // Initialize Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "Sector 91",
        description: "Payment for your order",
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || user.mobile || "" // Check for both phone and mobile
        },
        theme: {
          color: "#000000"
        },
        handler: async function (response) {
          try {
            // Prepare order details
            const orderData = {
              userId: user.id,
              paymentId: response.razorpay_payment_id,
              items: items.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                size: item.size
              })),
              shippingAddress: {
                ...mergedData,
              },
              total: total,
              status: 'confirmed', // Add order status
              paymentStatus: 'paid', // Add payment status
              orderDate: new Date().toISOString() // Add order date
            };

            // Send order details to backend
            const orderResponse = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
              },
              body: JSON.stringify(orderData),
            });

            if (!orderResponse.ok) {
              const errorData = await orderResponse.json();
              throw new Error(errorData.message || 'Failed to create order');
            }

            const orderResult = await orderResponse.json();

            // Clear cart and navigate to success page
            clearCart();
            showToast('Payment successful! Your order has been placed.');
            navigate('/user/order-success', { 
              state: { 
                orderId: orderResult.orderId,
                orderDetails: orderResult 
              }
            });

          } catch (error) {
            console.error('Order creation error:', error);
            showToast('Failed to create order. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            showToast('Payment cancelled');
          }
        }
      };

      // Create and open Razorpay payment window
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      showToast('Payment failed. Please try again.');
      setIsProcessing(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!items?.length || !address) {
    return (
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <p>Invalid payment request. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="pt-24 px-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Payment</h1>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
          <div className="border p-4 rounded-lg">
            <p className="font-medium">{mergedData.name}</p>
            <p>{mergedData.houseNo}, {mergedData.street}</p>
            <p>{mergedData.locality}</p>
            <p>{mergedData.city}, {mergedData.state} {mergedData.postalCode}</p>
            <p className="mt-2">Phone: {mergedData.phone || 'Not provided'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="border rounded-lg overflow-hidden">
            {items.map((item, index) => (
              <div key={index} className="border-b p-4 last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                  </div>
                  <p className="font-medium">₹{item.product.price * item.quantity}</p>
                </div>
              </div>
            ))}
            <div className="bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>₹{subtotal}</p>
              </div>
              <div className="flex justify-between">
                <p>Delivery</p>
                <p>₹{50}</p>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <p>Total Amount</p>
                <p>₹{total}</p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-3 rounded-md transition-colors duration-200 font-medium
            ${isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800'
            }`}
        >
          {isProcessing ? 'Processing...' : `Pay ₹${total}`}
        </button>
      </div>
    </>
  );
} 