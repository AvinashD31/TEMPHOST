import { useState, useEffect } from 'react';
import { Package, User, Edit2, Plus, MapPin, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToastStore } from '../../store/useToastStore';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/auth';
import { Link } from 'react-router-dom';
import Loader from '../../components/loader/Loader';
import { makeRequest } from '../../config/apiConfig';  // Adjust the path based on your file structure


export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const { showToast } = useToastStore();
  const { user, loading } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [mobile,setMobile]= useState(user.mobile)
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth.user);


  console.log(userData,'b');
  
  useEffect(() => {
    console.log('Profile component mounted');
    console.log('Current user:', user);
    console.log('Current loading state:', loading);
  }, [user, loading]);

  if (!user && !loading) {
    console.log('No user found, redirecting...');
    return <Navigate to="/auth/login" replace />;
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleMobileChange = (e) => {

    setUserData(prev => ({
      ...prev,
      mobile: e.target.value
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const newAddressData = {
        houseNo: formData.get('houseNo'),
        street: formData.get('street'),
        locality: formData.get('locality'),
        city: formData.get('city'),
        state: formData.get('state'),
        postalCode: formData.get('postalCode'),
        country: formData.get('country')
      };

      const updatedAddresses = [...addresses, newAddressData];

      const response = await fetch(`/api/users/${userId}/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ address: updatedAddresses }),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      const result = await response.json();
      setAddresses(updatedAddresses);
      setIsAddingNewAddress(false);
      showToast('Address added successfully');
      e.target.reset();
    } catch (error) {
      console.error('Error updating address:', error);
      showToast(error.message);
    }
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = user?._id || user?.id;
      if (!userId) throw new Error('User ID not found');

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ mobile: userData?.mobile })
      });

      if (!response.ok) {
        throw new Error('Failed to update mobile number');
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      dispatch(setUser(updatedUser));
      setIsEditingMobile(false);
      showToast('Mobile number updated successfully');
    } catch (error) {
      console.error('Error updating mobile number:', error);
      showToast(error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const [userResponse, ordersResponse] = await Promise.all([
          makeRequest(`/users/${user.id}`),
          makeRequest(`/users/${user.id}/orders`)
        ]);

        if (userResponse) {
          setUserData(userResponse);
        }
        if (ordersResponse) {
          setOrders(ordersResponse);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message.includes('404')) {
          setError("User data not found. Please try logging in again.");
        } else {
          setError("Failed to load profile data. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, dispatch]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;

      const userId = user?._id || user?.id;
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/orders?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  if (loading) {
    return <div className="pt-24 px-4">Loading...</div>;
  }

  if (!user) {
    return <div className="pt-24 px-4">Please log in to view your profile.</div>;
  }

  if (isLoading) {
    return <div className="pt-24 px-4">Loading profile data...</div>;
  }

  if (error) {
    return <div className="pt-24 px-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="pt-24 px-4 max-w-7xl mx-auto pb-16">
        <h1 className="text-3xl font-semibold mb-8 text-gray-900">My Account</h1>

        {/* Enhanced Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-12">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 pb-4 relative ${
                activeTab === 'profile'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <User size={20} />
              <span className="font-medium">Profile</span>
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-3 pb-4 relative ${
                activeTab === 'orders'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Package size={20} />
              <span className="font-medium">Order History</span>
              {activeTab === 'orders' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
              )}
            </button>
          </div>
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && userData && (
          <div className="max-w-4xl">
            <div className="space-y-8">
              {/* Personal Information section */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-medium mb-6 text-gray-900">Personal Information</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={userData.name || ''}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={userData.email || ''}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="tel"
                        value={userData?.mobile || authUser?.mobile || ''}
                        onChange={handleMobileChange}
                        className={`w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 ${
                          !isEditingMobile ? 'bg-gray-50' : 'bg-white'
                        }`}
                        disabled={!isEditingMobile}
                      />
                      <button
                        onClick={() => setIsEditingMobile(!isEditingMobile)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={20} className="text-gray-600" />
                      </button>
                    </div>
                    {isEditingMobile && (
                      <button
                        onClick={handleMobileSubmit}
                        className="mt-3 bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information section */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-medium text-gray-900">Address Information</h2>
                  <button
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {isAddingNewAddress ? (
                      <span>Cancel</span>
                    ) : (
                      <>
                        <span>Add New</span>
                        <Plus size={18} />
                      </>
                    )}
                  </button>
                </div>

                {/* New Address Form - Always present but hidden */}
                <div className={`transition-all duration-300 overflow-hidden ${isAddingNewAddress ? 'max-h-[1000px] mb-8' : 'max-h-0'}`}>
                  <div className="border-b border-gray-200 pb-8">
                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">House/Flat No.</label>
                          <input
                            type="text"
                            name="houseNo"
                            required
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Street</label>
                          <input
                            type="text"
                            name="street"
                            required
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Locality</label>
                          <input
                            type="text"
                            name="locality"
                            required
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            name="city"
                            required
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            name="state"
                            required
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Postal Code</label>
                          <input
                            type="text"
                            name="postalCode"
                            required
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Country</label>
                          <input
                            type="text"
                            name="country"
                            required
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Display Addresses as List */}
                <div className="space-y-4">
                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address, index) => (
                        <div
                          key={index}
                          className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-all hover:shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <MapPin size={18} className="text-gray-400" />
                                <p className="font-medium text-gray-900">{userData?.name || 'User'}</p>
                              </div>
                              <div className="space-y-1 text-gray-600 ml-7">
                                <p>
                                  {address.houseNo && `${address.houseNo}, `}
                                  {address.street}
                                </p>
                                <p>
                                  {address.locality && `${address.locality}, `}
                                  {address.city}
                                </p>
                                <p>
                                  {address.state} {address.postalCode && `- ${address.postalCode}`}
                                </p>
                                {address.country && (
                                  <p>{address.country}</p>
                                )}
                              </div>
                            </div>
                            {/* Add edit/delete buttons if needed */}
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Edit2 size={18} className="text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <MapPin size={24} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 mb-4">No saved addresses found.</p>
                      <button
                        onClick={() => setIsAddingNewAddress(true)}
                        className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Add New Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">Order #{order.orderId}</h3>
                          <span className={`px-4 py-1 text-sm rounded-full flex items-center gap-2 ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-500' :
                              order.status === 'processing' ? 'bg-blue-500' :
                              order.status === 'shipped' ? 'bg-purple-500' :
                              order.status === 'cancelled' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></span>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Payment ID: {order.paymentId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-medium">₹{order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <div className="text-sm text-gray-500 mt-2 space-x-4">
                                <span>Qty: {item.quantity}</span>
                                {item.size && <span>Size: {item.size}</span>}
                              </div>
                            </div>
                          </div>
                          <p className="font-medium text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Package size={32} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-6">No orders found.</p>
                <Link 
                  to="/user/home" 
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ShoppingBag size={18} />
                  <span>Start Shopping</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 