import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../../store/useToastStore';
import { makeRequest } from '../../config/apiconfig';

export default function AddressSelection() {
  const { user, refreshUser } = useAuth();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');

  // Update the fetch addresses useEffect
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userId = user._id || user.id;
        const userData = await makeRequest(`/users/${userId}`);

        if (userData) {
          console.log('Fetched user data:', userData);

          if (userData.address) {
            const addressList = Array.isArray(userData.address) ? userData.address : [userData.address];
            const validAddresses = addressList.filter(addr => 
              addr && 
              typeof addr === 'object' &&
              Object.keys(addr).length > 0 &&
              addr.street // At least street should exist to be valid
            );
            
            console.log('Valid addresses:', validAddresses);
            setAddresses(validAddresses);
          } else {
            setAddresses([]);
          }
        }
      } catch (error) {
        console.error('Error in fetchAddresses:', error);
        showToast('Error loading addresses');
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user, showToast]);

  // Update the redirect useEffect
  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth/login');
    }
  }, [user, loading, navigate]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        showToast('User information not found');
        return;
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

      // Get current addresses from state
      const currentAddresses = [...addresses];
      
      // Append new address to existing addresses
      const updatedAddresses = [...currentAddresses, newAddressData];
      console.log('Updating with addresses:', updatedAddresses);

      const result = await makeRequest(`/${userId}/address`, {
        method: 'PUT',
        body: JSON.stringify({ address: updatedAddresses })
      });

      if (result) {
        // Update local state with the response from server
        const addressList = result.address || result.addresses || updatedAddresses;
        setAddresses(addressList);
        setSelectedAddress(newAddressData);
        showToast('Address saved successfully!');
        setActiveTab('saved');
        e.target.reset();
      }

    } catch (error) {
      console.error('Error saving address:', error);
      showToast(error.message || 'Error saving address');
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      showToast('Please select an address to proceed');
      return;
    }

    // Log the data to see what we're working with
    console.log('User data:', user);
    console.log('Selected address:', selectedAddress);

    const addressWithPhone = {
      ...selectedAddress,
      phone: user?.phone || user?.mobile || '', // Check for both phone and mobile
      name: user?.name || ''
    };

    console.log('Address with phone:', addressWithPhone);

    navigate('/user/payment', { 
      state: { 
        address: addressWithPhone, 
        items 
      }
    });
  };

  // Debug logging to check user and token
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    console.log('Current user:', user);
    console.log('Token exists:', !!token);
  }, [user]);

  // Add this useEffect to maintain selected address after refresh
  useEffect(() => {
    if (user?.address && !selectedAddress) {
      const currentAddress = Array.isArray(user.address) 
        ? user.address[user.address.length - 1] 
        : user.address;
      setSelectedAddress(currentAddress);
    }
  }, [user, selectedAddress]);

  // Update the useEffect that handles user refresh
  useEffect(() => {
    if (!user && localStorage.getItem('userData')) {
      const storedUser = JSON.parse(localStorage.getItem('userData'));
      refreshUser();
    }
  }, [user, refreshUser]);

  if (loading) {
    return (
      <div className="pt-24 px-4">
        <p>Loading addresses...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-24 px-4">
        <p>Please log in to view addresses.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Select Delivery Address</h1>

      {/* Address Selection Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-4 relative ${
              activeTab === 'saved'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`pb-4 relative ${
              activeTab === 'new'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Add New Address
          </button>
        </div>
      </div>

      {/* Address List */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address, index) => (
              <div
                key={index}
                onClick={() => setSelectedAddress(address)}
                className={`p-6 border rounded-xl cursor-pointer transition-all ${
                  selectedAddress === address
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium">{user.name || 'Delivery Address'}</p>
                    <div className="text-gray-600">
                      <p>{address.houseNo && `${address.houseNo}, `}{address.street}</p>
                      <p>{address.locality && `${address.locality}, `}{address.city}</p>
                      <p>{address.state} {address.postalCode && `- ${address.postalCode}`}</p>
                      {address.country && <p>{address.country}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">No saved addresses found.</p>
              <button
                onClick={() => setActiveTab('new')}
                className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add New Address
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add New Address Form */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-xl">
          <form onSubmit={handleSaveAddress} className="space-y-6">
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
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Proceed to Payment Button */}
      <div className="mt-8">
        <button
          onClick={handleProceedToPayment}
          disabled={!selectedAddress}
          className={`w-full md:w-auto px-8 py-3 rounded-lg transition-colors ${
            selectedAddress
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}