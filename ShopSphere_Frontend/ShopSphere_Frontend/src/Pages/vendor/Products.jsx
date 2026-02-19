import { useEffect, useState } from "react";
import { getVendorProducts, deleteVendorProduct, updateVendorProduct } from "../../api/vendor_axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [previews, setPreviews] = useState([]);
  const [sliderIndex, setSliderIndex] = useState({});
  const [viewIndex, setViewIndex] = useState(null); // New state for view modal
  const [viewSliderIndex, setViewSliderIndex] = useState(0); // Image slider in view
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getVendorProducts();
      setProducts(data);

      const initialIndex = {};
      data.forEach((_, i) => initialIndex[i] = 0);
      setSliderIndex(initialIndex);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (index) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const productToDelete = products[index];
      await deleteVendorProduct(productToDelete.id);

      const updated = [...products];
      updated.splice(index, 1);
      setProducts(updated);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditedProduct(products[index]);
    setPreviews(products[index].images || []);
  };

  const handleEditChange = (e) => {
    setEditedProduct({ ...editedProduct, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(
      files.map(file =>
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
      )
    ).then((imgs) => {
      setEditedProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imgs]
      }));
      setPreviews(prev => [...prev, ...imgs]);
    });
  };

  const removeImage = (index) => {
    setEditedProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      const productToUpdate = { ...editedProduct };

      // Map stock to quantity if it has been updated
      if (productToUpdate.stock) {
        productToUpdate.quantity = productToUpdate.stock;
      }

      await updateVendorProduct(editedProduct.id, productToUpdate);

      toast.success("Product updated successfully");
      await loadProducts(); // Refresh list from backend
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = (i) => {
    setSliderIndex(prev => ({
      ...prev,
      [i]: (prev[i] + 1) % (products[i].images?.length || 1)
    }));
  };

  const prevSlide = (i) => {
    setSliderIndex(prev => ({
      ...prev,
      [i]: (prev[i] - 1 + (products[i].images?.length || 1)) % (products[i].images?.length || 1)
    }));
  };

  const nextViewSlide = () => {
    if (!products[viewIndex]?.images) return;
    setViewSliderIndex((viewSliderIndex + 1) % products[viewIndex].images.length);
  };

  const prevViewSlide = () => {
    if (!products[viewIndex]?.images) return;
    setViewSliderIndex((viewSliderIndex - 1 + products[viewIndex].images.length) % products[viewIndex].images.length);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 relative">

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Product Management</h2>
        <span className="bg-gray-100 px-4 py-2 rounded-xl">
          Total: {products.length}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed border-gray-100 rounded-[40px] bg-gray-50/50">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products added yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm text-center">Ready to start selling? Add your first product and it will appear here.</p>
          <button
            onClick={() => window.location.href = '/vendoraddproduct'}
            className="px-8 py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
          >
            Add First Product
          </button>
        </div>
      ) : (
        /* PRODUCT GRID */
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-5 relative">

              {/* IMAGE SLIDER */}
              <div className="relative mb-3">
                {p.images?.length > 0 ? (
                  <>
                    <img
                      src={p.images[sliderIndex[i]]?.image?.startsWith('http')
                        ? p.images[sliderIndex[i]].image
                        : `${API_BASE_URL}${p.images[sliderIndex[i]]?.image}`}
                      className="h-44 w-full object-cover rounded-xl"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
                      }}
                    />
                    {p.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevSlide(i)}
                          className="absolute top-1/2 left-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-gray-800 shadow-md hover:bg-white transition-all transform -translate-y-1/2"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => nextSlide(i)}
                          className="absolute top-1/2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-gray-800 shadow-md hover:bg-white transition-all transform -translate-y-1/2"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="h-44 w-full bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                    <span className="text-xs font-bold uppercase tracking-widest">No Photos</span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-emerald-600 font-semibold mt-1">₹ {p.price}</p>
              <p className="text-sm text-gray-500">{p.category}</p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => startEdit(i)}
                  className="flex-1 border rounded-lg py-2 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setViewIndex(i);
                    setViewSliderIndex(0);
                  }}
                  className="flex-1 border rounded-lg py-2 hover:bg-gray-100"
                >
                  View
                </button>
                <button
                  onClick={() => deleteProduct(i)}
                  className="flex-1 bg-red-500 text-white rounded-lg py-2 hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT OVERLAY */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl relative shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

            <input
              name="name"
              value={editedProduct.name}
              onChange={handleEditChange}
              className="border rounded-lg p-2 w-full mb-2"
              placeholder="Product Name"
            />
            <textarea
              name="description"
              value={editedProduct.description}
              onChange={handleEditChange}
              className="border rounded-lg p-2 w-full mb-2"
              rows={3}
              placeholder="Description"
            />
            <input
              name="price"
              value={editedProduct.price}
              onChange={handleEditChange}
              className="border rounded-lg p-2 w-full mb-2"
              placeholder="Price"
            />
            <input
              name="stock"
              value={editedProduct.stock}
              onChange={handleEditChange}
              className="border rounded-lg p-2 w-full mb-2"
              placeholder="Stock"
            />
            <input
              name="category"
              value={editedProduct.category}
              onChange={handleEditChange}
              className="border rounded-lg p-2 w-full mb-2"
              placeholder="Category"
            />

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="border rounded-lg p-2 w-full mb-3"
            />

            {/* IMAGE PREVIEWS */}
            <div className="flex gap-2 flex-wrap mb-4">
              {previews.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} className="w-24 h-24 object-cover rounded" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={saveEdit}
                className="flex-1 bg-emerald-500 text-white py-2 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setEditingIndex(null)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={() => setEditingIndex(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* VIEW OVERLAY */}
      {viewIndex !== null && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto"
          onClick={() => setViewIndex(null)}
        >
          <div
            className="bg-white rounded-[32px] p-8 w-full max-w-3xl relative shadow-2xl animate-in fade-in zoom-in duration-300 pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="p-2 bg-violet-100 rounded-lg">
                  <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </span>
                Product Details
              </h2>
              <button
                onClick={() => setViewIndex(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* IMAGE SLIDER */}
              <div className="relative mb-8 group">
                {products[viewIndex]?.images?.length > 0 ? (
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                    <img
                      src={products[viewIndex].images[viewSliderIndex]?.image?.startsWith('http')
                        ? products[viewIndex].images[viewSliderIndex].image
                        : `${API_BASE_URL}${products[viewIndex].images[viewSliderIndex]?.image}`}
                      className="h-[400px] w-full object-contain mx-auto"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
                      }}
                    />
                    {products[viewIndex].images.length > 1 && (
                      <>
                        <button
                          onClick={prevViewSlide}
                          className="absolute top-1/2 left-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full text-gray-800 shadow-xl hover:bg-white transition-all transform -translate-y-1/2 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                          onClick={nextViewSlide}
                          className="absolute top-1/2 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full text-gray-800 shadow-xl hover:bg-white transition-all transform -translate-y-1/2 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {products[viewIndex].images.map((_, dotIdx) => (
                            <div
                              key={dotIdx}
                              className={`w-2 h-2 rounded-full transition-all ${dotIdx === viewSliderIndex ? 'bg-violet-600 w-4' : 'bg-gray-300'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-64 w-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="font-bold text-sm uppercase tracking-widest">No Photos Found</span>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Product Name</label>
                    <p className="text-xl font-bold text-gray-900 leading-tight">{products[viewIndex]?.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                    <p className="text-gray-600 leading-relaxed text-sm">{products[viewIndex]?.description || "No description provided."}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Price</span>
                    <span className="text-xl font-bold text-emerald-600">₹ {products[viewIndex]?.price}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Availability</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${products[viewIndex]?.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {products[viewIndex]?.quantity > 0 ? `${products[viewIndex]?.quantity} In Stock` : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Category</span>
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold capitalize">
                      {products[viewIndex]?.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
