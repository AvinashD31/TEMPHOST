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

  const createOrder = async (paymentResponse) => {
    try {
      const orderData = {
        userId: user._id || user.id,
        paymentId: paymentResponse.razorpay_payment_id,
        items: items.map(item => ({
          productId: item.product._id || item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
          image: item.product.image
        })),
        shippingAddress: {
          ...mergedData,
        },
        total: total,
        status: 'confirmed',
        paymentStatus: 'paid',
        orderDate: new Date().toISOString()
      };

      console.log('Creating order with data:', orderData);

      const orderResult = await makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      return orderResult;
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    if (!items?.length || !address || !user) {
      showToast('Missing required information for payment');
      setIsLoading(false);
      return;
    }

    try {
      setIsProcessing(true);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "Sector 91",
        description: "Payment for your order",
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || user.mobile || ""
        },
        theme: {
          color: "#000000"
        },
        handler: function (response) {
          // Handle the payment success synchronously first
          console.log('Payment successful:', response);
          showToast('Payment successful! Creating your order...');

          // Create order asynchronously
          createOrder(response)
            .then(orderResult => {
              console.log('Order created successfully:', orderResult);
              clearCart();
              
              // Navigate to success page
              navigate('/user/order-success', { 
                state: { 
                  orderId: orderResult?._id || 'pending',
                  orderDetails: orderResult || {
                    paymentId: response.razorpay_payment_id,
                    status: 'processing'
                  }
                }
              });
            })
            .catch(error => {
              console.error('Failed to create order:', error);
              showToast('Payment successful but order creation failed. Our team will contact you.');
              
              // Store order details for recovery
              localStorage.setItem('pendingOrder', JSON.stringify({
                paymentId: response.razorpay_payment_id,
                items,
                address: mergedData,
                total,
                timestamp: new Date().toISOString()
              }));

              // Navigate to a fallback success page
              navigate('/user/order-success', {
                state: {
                  orderId: 'pending',
                  paymentId: response.razorpay_payment_id,
                  status: 'processing'
                }
              });
            });
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            showToast('Payment cancelled');
          },
          escape: true,
          backdropclose: false
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
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