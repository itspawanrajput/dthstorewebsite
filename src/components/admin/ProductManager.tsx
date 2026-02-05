import React, { useState, useEffect } from 'react';
import { Product, User } from '../../types';
import { getProducts, saveProduct, deleteProduct } from '../../services/storageService';
import ImagePicker from '../ImagePicker';
import { Trash2, Plus, X } from 'lucide-react';

interface ProductManagerProps {
    user: User;
}

const ProductManager: React.FC<ProductManagerProps> = ({ user }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        title: '', price: '', originalPrice: '', type: 'DTH', features: [''], image: 'https://placehold.co/600x400', color: 'bg-blue-600'
    });

    useEffect(() => {
        const load = async () => setProducts(await getProducts());
        load();
    }, []);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.title || !newProduct.price) return;

        const productToAdd: Product = {
            id: `prod-${Date.now()}`,
            title: newProduct.title || '',
            price: newProduct.price || '',
            originalPrice: newProduct.originalPrice || '',
            type: newProduct.type as 'DTH' | 'Broadband',
            features: newProduct.features || [],
            image: newProduct.image || '',
            color: newProduct.color || 'bg-blue-600',
            isBestSeller: true
        };

        const updatedList = await saveProduct(productToAdd);
        setProducts(updatedList);
        setIsAddingProduct(false);
        setNewProduct({ title: '', price: '', originalPrice: '', type: 'DTH', features: [''], image: 'https://placehold.co/600x400', color: 'bg-blue-600' });
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Are you sure? This will remove the product from the public page.')) {
            const updated = await deleteProduct(id);
            setProducts(updated);
        }
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...(newProduct.features || [])];
        newFeatures[index] = value;
        setNewProduct({ ...newProduct, features: newFeatures });
    };

    const addFeatureField = () => {
        setNewProduct({ ...newProduct, features: [...(newProduct.features || []), ''] });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Product Inventory</h3>
                <button onClick={() => setIsAddingProduct(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    <Plus size={18} className="mr-2" /> Add Plan
                </button>
            </div>

            {isAddingProduct && (
                <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 animate-in slide-in-from-top-4">
                    <div className="flex justify-between mb-4">
                        <h4 className="text-lg font-bold">Add New Product</h4>
                        <button onClick={() => setIsAddingProduct(false)}><X size={20} className="text-gray-400" /></button>
                    </div>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required placeholder="Plan Title (e.g. Jio Fiber Gold)" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="p-2 border rounded" />
                        <input required placeholder="Price (e.g. ₹999)" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="p-2 border rounded" />
                        <input placeholder="Original Price (e.g. ₹1499)" value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })} className="p-2 border rounded" />
                        <select value={newProduct.type} onChange={e => setNewProduct({ ...newProduct, type: e.target.value as any })} className="p-2 border rounded">
                            <option value="DTH">DTH</option>
                            <option value="Broadband">Broadband</option>
                        </select>

                        {/* Image Picker for Product */}
                        <div className="md:col-span-2">
                            <ImagePicker
                                label="Product Image"
                                value={newProduct.image || ''}
                                onChange={(url) => setNewProduct({ ...newProduct, image: url })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                            {newProduct.features?.map((feat, idx) => (
                                <input key={idx} value={feat} onChange={e => handleFeatureChange(idx, e.target.value)} className="p-2 border rounded w-full mb-2" placeholder="Feature (e.g. Free Router)" />
                            ))}
                            <button type="button" onClick={addFeatureField} className="text-sm text-blue-600 hover:underline">+ Add Feature</button>
                        </div>

                        <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                            <button type="button" onClick={() => setIsAddingProduct(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Product</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                        <div className="h-40 bg-gray-100 relative">
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                            <button onClick={() => handleDeleteProduct(product.id)} className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:text-red-700 shadow-sm"><Trash2 size={16} /></button>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900">{product.title}</h4>
                                    <p className="text-sm text-gray-500">{product.type}</p>
                                </div>
                                <p className="font-bold text-blue-600">{product.price}</p>
                            </div>
                            <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                {product.features.slice(0, 3).map((f, i) => <li key={i}>• {f}</li>)}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductManager;
