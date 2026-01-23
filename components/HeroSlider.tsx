
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LeadForm from './LeadForm';
import { Lead, HeroSlide } from '../types';

interface HeroSliderProps {
    slides: HeroSlide[];
    onLeadSubmit: (lead: Lead) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides, onLeadSubmit }) => {
    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent(current === slides.length - 1 ? 0 : current + 1);
    };

    const prevSlide = () => {
        setCurrent(current === 0 ? slides.length - 1 : current - 1);
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [current, slides.length]);

    if (!slides || slides.length === 0) return null;

    return (
        <div className="relative bg-gray-900 overflow-hidden">
            {/* Background Slides */}
            <div className="relative h-[650px] md:h-[600px]">
                {slides.map((slide, index) => (
                    <div 
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.image})` }}
                        ></div>
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/80 to-transparent"></div>
                    </div>
                ))}

                {/* Content Container (Grid Layout for Form + Text) */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="grid md:grid-cols-2 gap-8 items-center h-full pt-16 md:pt-0">
                        {/* Text Content */}
                        <div className="text-white space-y-6 z-10 hidden md:block">
                            <span className="inline-block px-4 py-1 rounded-full bg-orange-500 text-sm font-semibold mb-2">
                                Limited Time Offer
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight transition-all duration-500 transform translate-y-0 opacity-100">
                                {slides[current].title}
                            </h1>
                            <p className="text-xl text-gray-200 max-w-lg">
                                {slides[current].subtitle}
                            </p>
                            <button 
                                onClick={() => document.getElementById('book-now')?.scrollIntoView({ behavior: 'smooth'})}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all"
                            >
                                {slides[current].cta}
                            </button>
                        </div>
                        
                        {/* Mobile Text (Simple) */}
                        <div className="text-white z-10 md:hidden text-center absolute top-10 left-0 right-0 px-4">
                             <h1 className="text-3xl font-bold mb-2">{slides[current].title}</h1>
                             <p className="text-sm text-gray-200">{slides[current].subtitle}</p>
                        </div>

                        {/* Form Container */}
                        <div id="book-now" className="w-full max-w-md mx-auto z-20 mt-20 md:mt-0">
                            <LeadForm onSubmit={onLeadSubmit} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <button 
                onClick={prevSlide} 
                className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition"
            >
                <ChevronLeft size={32} />
            </button>
            <button 
                onClick={nextSlide} 
                className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition"
            >
                <ChevronRight size={32} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                            index === current ? 'bg-orange-500 w-8' : 'bg-white/50 hover:bg-white'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
