import React, { useState, useEffect } from 'react';
import { SiteConfig, User } from '../../types';
import { getSiteConfig, saveSiteConfig } from '../../services/storageService';
import ImagePicker from '../ImagePicker';
import { RefreshCw, CheckCircle, Save, Globe, Layout, Image as ImageIcon } from 'lucide-react';

interface SiteSettingsProps {
    user: User;
}

const SiteSettings: React.FC<SiteSettingsProps> = ({ user }) => {
    const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        const load = async () => setSiteConfig(await getSiteConfig());
        load();
    }, []);

    const handleSaveConfig = async () => {
        if (siteConfig) {
            setSaveStatus('saving');
            await saveSiteConfig(siteConfig);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const updateSlide = (index: number, field: string, value: string) => {
        if (!siteConfig) return;
        const newSlides = [...siteConfig.heroSlides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSiteConfig({ ...siteConfig, heroSlides: newSlides });
    };

    const updateNavLink = (index: number, value: string) => {
        if (!siteConfig) return;
        const newLinks = [...siteConfig.navLinks];
        newLinks[index] = { ...newLinks[index], label: value };
        setSiteConfig({ ...siteConfig, navLinks: newLinks });
    };

    if (!siteConfig) return <div>Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Site Configuration</h3>
                    <p className="text-sm text-gray-500">Manage site logo, navigation, and images.</p>
                </div>
                <button
                    onClick={handleSaveConfig}
                    className={`flex items-center px-6 py-2 rounded-lg text-white font-medium transition ${saveStatus === 'saved' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={saveStatus === 'saving'}
                >
                    {saveStatus === 'saving' ? <RefreshCw className="animate-spin mr-2" /> : saveStatus === 'saved' ? <CheckCircle className="mr-2" /> : <Save className="mr-2" />}
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Branding Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="flex items-center text-md font-bold text-gray-800 mb-4"><Globe size={18} className="mr-2 text-blue-600" /> Branding & Navigation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                        <input
                            type="text"
                            value={siteConfig.logoText}
                            onChange={(e) => setSiteConfig({ ...siteConfig, logoText: e.target.value })}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo Color (Tailwind Class)</label>
                        <input
                            type="text"
                            value={siteConfig.logoColorClass}
                            onChange={(e) => setSiteConfig({ ...siteConfig, logoColorClass: e.target.value })}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            placeholder="text-blue-600"
                        />
                    </div>

                    <div className="md:col-span-2 border-t pt-4 mt-2">
                        <ImagePicker
                            label="Upload Logo (Replaces Text)"
                            value={siteConfig.logoImage || ''}
                            onChange={(url) => setSiteConfig({ ...siteConfig, logoImage: url })}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Navigation Links (Rename)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {siteConfig.navLinks.map((link, idx) => (
                            <div key={link.id}>
                                <span className="text-xs text-gray-500 uppercase">{link.target}</span>
                                <input
                                    value={link.label}
                                    onChange={(e) => updateNavLink(idx, e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hero Slider Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="flex items-center text-md font-bold text-gray-800 mb-4"><Layout size={18} className="mr-2 text-purple-600" /> Hero Slider Content</h4>
                <div className="space-y-6">
                    {siteConfig.heroSlides.map((slide, idx) => (
                        <div key={slide.id} className="border p-4 rounded-lg bg-gray-50">
                            <div className="flex justify-between mb-2">
                                <h5 className="font-bold text-sm text-gray-600">Slide {idx + 1}</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-1 space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Title</label>
                                        <input value={slide.title} onChange={(e) => updateSlide(idx, 'title', e.target.value)} className="w-full border p-2 rounded text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Subtitle</label>
                                        <input value={slide.subtitle} onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)} className="w-full border p-2 rounded text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">CTA Text</label>
                                        <input value={slide.cta} onChange={(e) => updateSlide(idx, 'cta', e.target.value)} className="w-full border p-2 rounded text-sm" />
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <ImagePicker
                                        label="Slide Image"
                                        value={slide.image}
                                        onChange={(url) => updateSlide(idx, 'image', url)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Special Page Images */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="flex items-center text-md font-bold text-gray-800 mb-4"><ImageIcon size={18} className="mr-2 text-orange-600" /> Special Offer Page Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <ImagePicker
                            label="Hero Background"
                            value={siteConfig.specialOfferImages.heroBackground}
                            onChange={(url) => setSiteConfig({ ...siteConfig, specialOfferImages: { ...siteConfig.specialOfferImages, heroBackground: url } })}
                        />
                    </div>
                    <div>
                        <ImagePicker
                            label="Side Promo Image"
                            value={siteConfig.specialOfferImages.sideImage}
                            onChange={(url) => setSiteConfig({ ...siteConfig, specialOfferImages: { ...siteConfig.specialOfferImages, sideImage: url } })}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SiteSettings;
