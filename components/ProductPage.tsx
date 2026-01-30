
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProducts } from '../services/storageService';
import { Check, Star, ArrowRight, Filter } from 'lucide-react';

interface ProductPageProps {
    onBookNow: () => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ onBookNow }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'DTH' | 'Broadband'>('ALL');

    useEffect(() => {
        setProducts(getProducts());
    }, []);

    const filteredProducts = products.filter(p => filter === 'ALL' || p.type === filter);

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Explore Our Plans</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Whether you need lightning fast internet or endless entertainment, we have the perfect plan for you.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex bg-white rounded-full p-1 shadow-md border border-gray-200">
                        {['ALL', 'DTH', 'Broadband'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type as any)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${filter === type
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {type === 'ALL' ? 'All Plans' : type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full">
                            {/* Image Area */}
                            <div className="relative h-56 overflow-hidden bg-gray-200">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                                {product.isBestSeller && (
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                        BEST SELLER
                                    </div>
                                )}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 ${product.color || 'bg-blue-500'}`}></div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase tracking-wide`}>
                                        {product.type}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>

                                <div className="flex items-baseline mb-4">
                                    <span className="text-3xl font-extrabold text-gray-900">{product.price}</span>
                                    <span className="ml-2 text-sm text-gray-400 line-through">{product.originalPrice}</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {product.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-600">
                                            <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={onBookNow}
                                    className={`w-full py-3 rounded-xl text-white font-bold flex items-center justify-center transition-colors shadow-lg ${product.type === 'DTH' ? 'bg-gray-800 hover:bg-gray-900' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    Book Now <ArrowRight size={18} className="ml-2" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No plans found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
