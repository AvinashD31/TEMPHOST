import React, { useState } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockProducts } from '../../data/mockData';

export default function Home() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    customTitle: '',
    review: ''
  });

  // Predefined title options
  const titleOptions = [
    "",
    "Great Quality Product",
    "Excellent Service",
    "Perfect Fit",
    "Amazing Design",
    "Value for Money",
    "Quick Delivery",
    "Highly Recommended",
    "Good Experience",
    "Other (Add custom title)"
  ];

  const handleTitleChange = (selectedTitle) => {
    if (selectedTitle === "Other (Add custom title)") {
      setNewReview({
        ...newReview,
        title: selectedTitle,
        customTitle: ''
      });
    } else {
      setNewReview({
        ...newReview,
        title: selectedTitle,
        customTitle: ''
      });
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      alert('Please select a rating');
      return;
    }

    // Prepare the final review data
    const finalReview = {
      rating: newReview.rating,
      title: newReview.title === "Other (Add custom title)" ? newReview.customTitle : newReview.title,
      review: newReview.review
    };

    // Here you would typically send the review to your backend
    console.log('Review submitted:', finalReview);
    setShowReviewForm(false);
    setNewReview({ rating: 0, title: '', customTitle: '', review: '' });
  };

  // Get first product of each color
  const getFirstProductByColor = (color) => {
    const product = mockProducts.find(p => p.category === color);
    return product ? product.id : '';
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="relative w-full h-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          preload="auto"
        >
          <source
            src="https://res.cloudinary.com/dzmtqeyag/video/upload/v1737294166/Promo_fbvtim.mov"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      {/* New Collections Banner
      <div className="grid grid-cols-1 mt-1">
        <Link to="/user/category/new" className="relative aspect-[21/9] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="New Collection"
            className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
            <div className="ml-16 transform hover:translate-x-4 transition-transform duration-500">
              <h2 className="text-white text-5xl font-light mb-4">NEW COLLECTIONS</h2>
              <p className="text-white/80 text-xl mb-6 font-light">Discover our latest arrivals</p>
              <button className="bg-white text-black px-8 py-3 flex items-center group">
                EXPLORE NOW 
                <ChevronRight className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300" size={20} />
              </button> 
            </div>
          </div>
        </Link>
      </div> */}

      {/* Color Categories Section */}
      <div className="py-16 px-8">
        {/* Animated Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light mb-3 relative inline-block">
            NEW LAUNCHES
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-black origin-center animate-width"></div>
          </h2>
          <p className="text-gray-600 italic">Find your perfect shade</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 animate-fadeIn">
          {/* Black Card */}
          <Link 
            to={`/user/product/${getFirstProductByColor('black')}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src="https://res.cloudinary.com/dzmtqeyag/image/upload/v1737288497/black_gnayut.webp"
              alt="Black Collection"
              className="w-full h-full object-contain bg-gray-50 transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
              <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:top-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="bg-white text-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors duration-300 rounded flex items-center group font-['Graduate'] whitespace-nowrap">
                  SHOP NOW 
                  <ChevronRight className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300" size={15} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full text-center pb-4 opacity-100 group-hover:opacity-0 transform group-hover:translate-y-2 transition-all duration-300 ease-out">
                <h3 className="text-black text-xl font-light font-['Graduate']">BLACK</h3>
              </div>
            </div>
          </Link>

          {/* Brown Card */}
          <Link 
            to={`/user/product/${getFirstProductByColor('brown')}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src="https://res.cloudinary.com/dzmtqeyag/image/upload/v1737288499/brown_yh4tdd.webp"
              alt="Brown Collection"
              className="w-full h-full object-contain bg-gray-50 transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
              <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:top-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="bg-white text-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors duration-300 rounded flex items-center group font-['Graduate'] whitespace-nowrap">
                  SHOP NOW 
                  <ChevronRight className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300" size={15} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full text-center pb-4 opacity-100 group-hover:opacity-0 transform group-hover:translate-y-2 transition-all duration-300 ease-out">
                <h3 className="text-black text-xl font-light font-['Graduate']">RECHARGE</h3>
              </div>
            </div>
          </Link>

          {/* Beige Card */}
          <Link 
            to={`/user/product/${getFirstProductByColor('beige')}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src="https://res.cloudinary.com/dzmtqeyag/image/upload/v1737288502/biege_ydkmin.webp"
              alt="Beige Collection"
              className="w-full h-full object-contain bg-gray-50 transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
              <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:top-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="bg-white text-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors duration-300 rounded flex items-center group font-['Graduate'] whitespace-nowrap">
                  SHOP NOW 
                  <ChevronRight className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300" size={15} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full text-center pb-4 opacity-100 group-hover:opacity-0 transform group-hover:translate-y-2 transition-all duration-300 ease-out">
                <h3 className="text-black text-xl font-light font-['Graduate']">STARDUST</h3>
              </div>
            </div>
          </Link>

          {/* Maroon Card */}
          <Link 
            to={`/user/product/${getFirstProductByColor('maroon')}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src="https://res.cloudinary.com/dzmtqeyag/image/upload/v1737288498/maroon_umzyba.webp"
              alt="Maroon Collection"
              className="w-full h-full object-contain bg-gray-50 transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
              <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:top-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="bg-white text-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors duration-300 rounded flex items-center group font-['Graduate'] whitespace-nowrap">
                  SHOP NOW 
                  <ChevronRight className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300" size={15} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full text-center pb-4 opacity-100 group-hover:opacity-0 transform group-hover:translate-y-2 transition-all duration-300 ease-out">
                <h3 className="text-black text-xl font-light font-['Graduate']">JUST LIVI'N</h3>
              </div>
            </div>
          </Link>

          {/* Yellow Card */}
          <Link 
            to={`/user/product/${getFirstProductByColor('yellow')}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src="https://res.cloudinary.com/dzmtqeyag/image/upload/v1737288503/yellow_k6ujvq.webp"
              alt="Yellow Collection"
              className="w-full h-full object-contain bg-gray-50 transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
              <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:top-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="bg-white text-black px-5 py-2 text-sm hover:bg-black hover:text-white transition-colors duration-300 rounded flex items-center group font-['Graduate'] whitespace-nowrap">
                  SHOP NOW 
                  <ChevronRight className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300" size={15} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full text-center pb-4 opacity-100 group-hover:opacity-0 transform group-hover:translate-y-2 transition-all duration-300 ease-out">
                <h3 className="text-black text-xl font-light font-['Graduate']">BEAR</h3>
              </div>
            </div>
          </Link>
        </div>

        {/* Our Story Section */}
        <div className="max-w-4xl mx-auto mt-24 px-4 sm:px-6 lg:px-8">
          <h2 className="text-6xl font-700 text-center mb-8 font-['']">
            Our Story
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed text-center">
          At Sector 91, we believe that great style shouldn’t cost you an arm and a leg.
          We know there’s a common idea that higher prices mean better quality, but we’re here to challenge that.
          Our mission is simple: to offer stylish, high-quality clothing at prices everyone can afford.
          Sector 91 was born out of the frustration that many people feel when they have to choose between looking good and spending too much. 
          We wanted to create a brand that proves you don’t need to break the bank to wear well-made, fashionable clothes.
          Every piece we design is carefully crafted to offer both style and durability without the inflated prices that you often find in high-end stores.
    
          </p>
        </div>

        {/* Testimonials Section */}
        <div className="mt-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold italic font-['Playfair_Display']">
              What Our Customers Say
            </h2>
            <Link
              to="/user/testimonials"
              className="text-black hover:text-gray-600 transition-colors relative group"
            >
              <span className="text-sm font-medium">View All Reviews</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          </div>
          
          <div className="relative">
            {/* Auto-scrolling container with hover pause */}
            <div className="flex animate-scroll hover:pause group/scroll">
              {/* First set of testimonials */}
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex">
                  {/* Testimonial cards with hover effect */}
                  <div className="group/card">
                    <TestimonialCard
                      name="Sarah Johnson"
                      status="Verified Buyer"
                      text="The quality of their products is exceptional. I've never been disappointed with any of my purchases. The attention to detail is remarkable! The fabric quality is outstanding and the stitching is perfect. Every time I wear their clothes, I receive compliments. Their customer service team is also very helpful and responsive. I would highly recommend their products to anyone looking for quality clothing."
                      className="transform transition-transform duration-300 group-hover/card:scale-105"
                    />
                  </div>

                  <div className="group/card">
                    <TestimonialCard
                      name="Michael Chen"
                      status="Loyal Customer"
                      text="The customer service is outstanding. They went above and beyond to help me find exactly what I was looking for. The team was patient and provided detailed information about the products. The delivery was quick and the packaging was excellent. I've been shopping here for years and the quality has always been consistent."
                      className="transform transition-transform duration-300 group-hover/card:scale-105"
                    />
                  </div>

                  <div className="group/card">
                    <TestimonialCard
                      name="Rachel Smith"
                      status="Fashion Enthusiast"
                      text="Every piece I've bought has become a staple in my wardrobe. The designs are timeless and the quality is unmatched. The fits are perfect and the styles are versatile. I appreciate their attention to sustainable practices and ethical manufacturing. Their commitment to quality is evident in every piece."
                      className="transform transition-transform duration-300 group-hover/card:scale-105"
                    />
                  </div>

                  <div className="group/card">
                    <TestimonialCard
                      name="David Wilson"
                      status="Regular Customer"
                      text="The shipping is always fast and the packaging is eco-friendly. It's refreshing to see a brand that cares about both quality and sustainability. Their commitment to reducing environmental impact while maintaining high quality standards is commendable. The products always arrive in perfect condition."
                      className="transform transition-transform duration-300 group-hover/card:scale-105"
                    />
                  </div>

                  <div className="group/card">
                    <TestimonialCard
                      name="Emma Davis"
                      status="Style Consultant"
                      text="As a style consultant, I often recommend SECTOR 91 to my clients. The versatility and quality of their pieces are exactly what modern wardrobes need. The classic designs with modern touches make their pieces perfect for any occasion. The durability of their products is impressive."
                      className="transform transition-transform duration-300 group-hover/card:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Write a Review Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-block bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors"
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4 relative">
            <button
              onClick={() => setShowReviewForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6">Write Your Review</h2>
            
            <form onSubmit={handleSubmitReview}>
              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        } hover:fill-yellow-400 hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {newReview.rating > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newReview.rating - 1]}
                  </p>
                )}
              </div>

              {/* Review Title Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <select
                  value={newReview.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                >
                  {titleOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option || "Select a title (optional)"}
                    </option>
                  ))}
                </select>

                {/* Custom Title Input */}
                {newReview.title === "Other (Add custom title)" && (
                  <input
                    type="text"
                    value={newReview.customTitle}
                    onChange={(e) => setNewReview({ ...newReview, customTitle: e.target.value })}
                    className="w-full p-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your custom title"
                  />
                )}
              </div>

              {/* Review Content */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Your Review</label>
                <textarea
                  value={newReview.review}
                  onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                  className="w-full p-2 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Tell us about your experience with our products"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
        <Link to="/user/category/men" className="relative aspect-square">
          <img
            src="https://images.unsplash.com/photo-1488161628813-04466f872be2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="Men"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all">
            <h2 className="text-white text-4xl font-light">MEN</h2>
          </div>
        </Link>
      </div> */}
    </div>
  );
}

const TestimonialCard = ({ name, status, text, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const needsReadMore = text.length > maxLength;

  return (
    <div className={`flex-none w-80 mx-4 ${className}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xl font-semibold">{name[0]}</span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-gray-600">{status}</p>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className="w-4 h-4 text-yellow-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden transition-all duration-300 ease-in-out" 
             style={{ maxHeight: isExpanded ? '1000px' : '100px' }}>
          <p className="text-gray-700">
            {text}
          </p>
        </div>
        {needsReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm mt-2 transition-colors duration-200"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
};