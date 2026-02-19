import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchProducts, AddToCart, AddToWishlist, RemoveFromWishlist } from "../../Store";
import toast from "react-hot-toast";
import ProductCard from "../../components/ProductCard";

const CATEGORIES = [
  { id: "All", label: "All Products" },
  { id: "Electronics", label: "Electronics" },
  { id: "Sports", label: "Sports" },
  { id: "Fashion", label: "Fashion" },
  { id: "Books", label: "Books" },
  { id: "Home & Kitchen", label: "Home & Kitchen" },
  { id: "Grocery", label: "Grocery" },
  { id: "Beauty", label: "Beauty" },
  { id: "Toys", label: "Toys" },
  { id: "Automotive", label: "Automotive" },
  { id: "Services", label: "Services" },
  { id: "Other", label: "Other" },
];

const BANNERS = [
  {
    id: 1,
    title: "The Ultimate Future Collection",
    subtitle: "Season 2024",
    description: "Experience the next generation of premium tech and lifestyle products. Designed for those who dare to lead.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070",
    cta: "Explore Future",
    color: "from-blue-600 to-indigo-600"
  },
  {
    id: 2,
    title: "Elegance in Every Detail",
    subtitle: "Luxury Minimalist",
    description: "Discover a curated collection of minimalist essentials that redefine modern sophistication and timeless style.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070",
    cta: "View Collection",
    color: "from-purple-600 to-fuchsia-600"
  },
  {
    id: 3,
    title: "Active Life Redefined",
    subtitle: "High Performance",
    description: "Gear up with our high-performance athletic collection. Engineered for maximum comfort and peak athletic ability.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2070",
    cta: "Get Started",
    color: "from-orange-500 to-red-600"
  }
];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const categoryRefs = useRef({});

  // Update local search state when URL changes
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const allProducts = useSelector((state) => state.products.all || []);
  const isLoading = useSelector((state) => state.products.isLoading);
  const wishlist = useSelector((state) => state.wishlist);

  const productsByCategory = {
    All: allProducts,
    Electronics: useSelector((state) => state.products.electronics),
    Sports: useSelector((state) => state.products.sports),
    Fashion: useSelector((state) => state.products.fashion),
    Books: useSelector((state) => state.products.books),
    "Home & Kitchen": useSelector((state) => state.products.home_kitchen),
    Grocery: useSelector((state) => state.products.grocery),
    Beauty: useSelector((state) => state.products.beauty_personal_care),
    Toys: useSelector((state) => state.products.toys_games),
    Automotive: useSelector((state) => state.products.automotive),
    Services: useSelector((state) => state.products.services),
    Other: useSelector((state) => state.products.other),
  };

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = (productsByCategory[activeCategory] || []).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleWishlistClick = (item) => {
    const user = localStorage.getItem("accessToken");
    if (!user) {
      toast.error("Please login to manage your wishlist");
      navigate("/login");
      return;
    }
    if (isInWishlist(item.name)) {
      dispatch(RemoveFromWishlist(item));
      toast.success("Removed from wishlist");
    } else {
      dispatch(AddToWishlist(item));
      toast.success("Added to wishlist");
    }
  };

  const handleAddToCartClick = (item) => {
    const user = localStorage.getItem("accessToken");
    if (!user) {
      toast.error("Please login to add items to your cart");
      navigate("/login");
      return;
    }
    dispatch(AddToCart(item));
    toast.success("Added to cart");
  };

  const isInWishlist = (itemName) => {
    return wishlist.some((item) => item.name === itemName);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-violet-600 font-bold animate-pulse">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  const banner = BANNERS[currentBanner];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CATEGORIES SECTION (Now between Navbar and Banner) */}
      <section id="categories-section" className="bg-white border-b border-gray-100 shadow-sm pt-24 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 w-full scrollbar-hide justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeCategory === cat.id ? "bg-violet-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HERO CAROUSEL (Reduced Height) */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 md:px-32">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-white/80 font-bold tracking-widest uppercase text-sm mb-4"
              >
                {banner.subtitle}
              </motion.p>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-6xl font-black text-white mb-4 max-w-2xl leading-tight"
              >
                {banner.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-gray-200 text-base md:text-lg mb-8 max-w-xl"
              >
                {banner.description}
              </motion.p>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })}
                className={`w-fit px-8 py-3 bg-gradient-to-r ${banner.color} text-white font-bold rounded-2xl flex items-center gap-3 hover:scale-105 transition-transform shadow-xl`}
              >
                {banner.cta} <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 right-12 z-30 flex gap-3">
          <button onClick={() => setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentBanner((prev) => (prev + 1) % BANNERS.length)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {currentProducts.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              navigate={navigate}
              handleWishlistClick={handleWishlistClick}
              handleAddToCartClick={handleAddToCartClick}
              isInWishlist={isInWishlist}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-400">No products found in this category</h3>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-16 gap-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`w-12 h-12 rounded-xl font-bold transition-all ${currentPage === i + 1 ? "bg-violet-600 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-100"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
