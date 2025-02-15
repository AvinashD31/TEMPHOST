import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import Loader from '../../components/loader/Loader';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { showToast } = useToastStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate delivery charge based on total number of items
  const calculateDeliveryCharge = () => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems === 1) return 50;
    if (totalItems === 2) return 75;
    return 100; // for 3 or more items
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Calculate final total with variable delivery charge
  const deliveryCharge = calculateDeliveryCharge();
  const total = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="pt-24 px-4 text-center min-h-[60vh] flex items-center justify-center">
        <div>
          <h2 className="text-2xl font-light mb-4">Your cart is empty</h2>
          <p className="text-gray-600">Start shopping to add items to your cart.</p>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!user) {
      showToast('Please login to continue with checkout');
      navigate('/auth/login');
      return;
    }

    try {
      setIsProcessing(true);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100, // This will now include delivery charge
        currency: "INR",
        name: "Sector 91",
        description: "Payment for your order",
        handler: async function (response) {
          try {
            // console.log('Payment successful, creating order...'); // Debug log
            // console.log('User:', user); // Debug log
            // console.log('Items:', items); // Debug log

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
                name: user.name,
                phone: user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zipCode: user.address?.zipCode || ''
              },
              total: total
            };

            // Log the complete order data for debugging
            // console.log('Complete order data:', JSON.stringify(orderData, null, 2));

            // Send order details to backend
            const orderResponse = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData),
            });

            // If the response is not ok, try to get the error message
            if (!orderResponse.ok) {
              const errorText = await orderResponse.text();
              console.error('Error response:', errorText);
              
              try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || 'Failed to create order');
              } catch (e) {
                throw new Error(`Failed to create order: ${errorText}`);
              }
            }

            const orderResult = await orderResponse.json();
            console.log('Order created successfully:', orderResult);

            // Clear cart and show success message
            clearCart();
            showToast('Payment successful! Your order has been placed.');
            navigate('/user/order-success');
          } catch (error) {
            console.error('Order creation error:', error);
            showToast('Failed to create order. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#000000"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      navigate('/user/address-selection');
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="container mx-auto px-4">
        <div className="pt-24 px-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-light mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4 sm:gap-6 py-6 border-b"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-28 sm:w-24 sm:h-32 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                      </div>
                      <p className="text-sm font-medium">
                        RS: {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="p-2 hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="p-2 hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 sticky top-24">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs:{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>Rs:{deliveryCharge.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-medium">
                    <span>Total</span>
                    <span>Rs:{total.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 px-6 mt-6 block text-center hover:bg-gray-900 transition-colors disabled:bg-gray-400"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}