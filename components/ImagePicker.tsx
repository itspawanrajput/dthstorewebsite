
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon, X, Trash2, Check, Grid } from 'lucide-react';
import { MediaItem } from '../types';
import { getMediaCatalog, saveMediaItem, deleteMediaItem } from '../services/storageService';
import { processImageFile } from '../services/imageService';
import { v4 as uuidv4 } from 'uuid';

interface ImagePickerProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'catalog' | 'upload' | 'url'>('catalog');
    const [catalog, setCatalog] = useState<MediaItem[]>([]);
    const [urlInput, setUrlInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCatalog(getMediaCatalog());
        }
    }, [isOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            const optimizedDataUrl = await processImageFile(file);
            const newItem: MediaItem = {
                id: Date.now().toString(),
                data: optimizedDataUrl,
                name: file.name,
                createdAt: Date.now()
            };
            const updatedCatalog = saveMediaItem(newItem);
            setCatalog(updatedCatalog);
            onChange(optimizedDataUrl); // Auto-select
            setActiveTab('catalog'); // Switch to catalog view
        } catch (error) {
            console.error("Image processing failed", error);
            alert("Failed to process image. Try a smaller file.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this image from catalog?")) {
            const updated = deleteMediaItem(id);
            setCatalog(updated);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput) {
            onChange(urlInput);
            setIsOpen(false);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            
            {/* Preview Box */}
            <div className="flex gap-4 items-start">
                <div 
                    className="relative group w-32 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-blue-500 transition"
                    onClick={() => setIsOpen(true)}
                >
                    {value ? (
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <ImageIcon size={24} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Change</span>
                    </div>
                </div>
                
                <div className="flex-1">
                     <input 
                        type="text" 
                        value={value} 
                        readOnly
                        className="w-full text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-2 mb-2 truncate"
                     />
                     <button 
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center"
                     >
                        <ImageIcon size={16} className="mr-1"/> Open Media Library
                     </button>
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[600px] flex flex-col overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900">Media Library</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b bg-gray-50">
                            <button 
                                onClick={() => setActiveTab('catalog')}
                                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'catalog' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                            >
                                <Grid size={16} className="mr-2"/> My Catalog
                            </button>
                            <button 
                                onClick={() => setActiveTab('upload')}
                                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'upload' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                            >
                                <Upload size={16} className="mr-2"/> Upload New
                            </button>
                            <button 
                                onClick={() => setActiveTab('url')}
                                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'url' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                            >
                                <LinkIcon size={16} className="mr-2"/> Insert from URL
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                            
                            {/* CATALOG VIEW */}
                            {activeTab === 'catalog' && (
                                <div className="space-y-4">
                                    {catalog.length === 0 ? (
                                        <div className="text-center py-20 text-gray-400">
                                            <ImageIcon size={48} className="mx-auto mb-4 opacity-30"/>
                                            <p>No images in catalog.</p>
                                            <button onClick={() => setActiveTab('upload')} className="text-blue-600 hover:underline mt-2">Upload one now</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {catalog.map(item => (
                                                <div 
                                                    key={item.id} 
                                                    className={`group relative aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 cursor-pointer transition ${value === item.data ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-300'}`}
                                                    onClick={() => {
                                                        onChange(item.data);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <img src={item.data} alt={item.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                                                         {value === item.data && (
                                                             <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                                                 <Check size={16} />
                                                             </div>
                                                         )}
                                                    </div>
                                                    <button 
                                                        onClick={(e) => handleDelete(e, item.id)}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 hover:bg-red-700 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate px-2">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* UPLOAD VIEW */}
                            {activeTab === 'upload' && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow border border-dashed border-gray-300 text-center">
                                        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                            {isProcessing ? <Upload className="animate-bounce"/> : <Upload size={32} />}
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                                            {isProcessing ? 'Optimizing Image...' : 'Click to Upload'}
                                        </h4>
                                        <p className="text-sm text-gray-500 mb-6">
                                            JPG, PNG supported. Images will be optimized automatically.
                                        </p>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileUpload}
                                            disabled={isProcessing}
                                            className="block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100
                                            "
                                        />
                                    </div>
                                </div>
                            )}

                            {/* URL VIEW */}
                            {activeTab === 'url' && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-full max-w-md space-y-4">
                                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                        <input 
                                            type="text" 
                                            placeholder="https://example.com/image.jpg"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button 
                                            onClick={handleUrlSubmit}
                                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Use this Image
                                        </button>
                                        
                                        <div className="mt-8 pt-6 border-t">
                                            <p className="text-xs text-gray-500 text-center mb-4">Or pick a demo image</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070",
                                                    "https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=2071",
                                                    "https://images.unsplash.com/photo-1621944626154-7128148b8159?q=80&w=2070"
                                                ].map((url, i) => (
                                                    <img 
                                                        key={i} 
                                                        src={url} 
                                                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                                        onClick={() => { onChange(url); setIsOpen(false); }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagePicker;
