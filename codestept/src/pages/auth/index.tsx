import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import AuthM from '@/components/Modals/AuthM';
import { authModalState } from '@/atoms/authModalAtom';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { authAtom } from '@/atoms/authAtom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '@/lib/config';

// Carousel Component
const Carousel: React.FC = () => {
  const images = ['/pic1.png', '/pic2.png', '/pic3.png'];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToImage = (index: number) => setCurrentIndex(index);

  return (
    <div className="relative w-full max-w-4xl h-[500px] mx-auto z-10">
      <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
        {images.map((src, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out transform ${
              currentIndex === index
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0'
            }`}
          >
            <Image
              src={src}
              alt={`Carousel image ${index + 1}`}
              fill
              className="object-cover rounded-2xl"
              priority
              onError={() => console.warn(`Failed to load image: ${src}`)}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-gradient-to-r from-black/70 to-transparent text-white p-3 rounded-full z-20 hover:bg-black/90 transition-all duration-300"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-gradient-to-l from-black/70 to-transparent text-white p-3 rounded-full z-20 hover:bg-black/90 transition-all duration-300"
        aria-label="Next slide"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-blue-400 scale-125' : 'bg-gray-300 hover:bg-gray-100'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const AuthPage: React.FC = () => {
  const [authModal] = useAtom(authModalState);
  const [user, setUser] = useState(authAtom);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) verifyToken(token);
    else setPageLoading(false);
  }, [router]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        router.push('/');
      } else {
        localStorage.removeItem('token');
        setPageLoading(false);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setPageLoading(false);
    }
  };

  if (pageLoading) return <div className="text-white text-center pt-20">Loading...</div>;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-black">
      {/* Optional Subtle Overlay */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <Navbar />
        <ToastContainer />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] space-y-8 px-4 animate-fade-in">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold text-center tracking-tight drop-shadow-lg">
            Bine ai venit pe <span className="text-blue-400">CODestept</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl text-center max-w-2xl">
            Descopera o lume plina de provocari si invata cum sa le depasesti! <br />
          </p>
          <Carousel />
        </div>
        
      </div>
	  {authModal.isOpen && (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<AuthM />
		</div>
		)}
    </div>
  );
};

export default AuthPage;