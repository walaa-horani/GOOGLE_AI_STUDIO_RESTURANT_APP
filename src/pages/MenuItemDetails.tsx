import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, ChevronLeft, ChevronRight, UtensilsCrossed, Flame, Clock } from 'lucide-react';
import ReservationModal from '../components/ReservationModal';

export default function MenuItemDetails() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<any>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId) return;
      
      setLoading(true);
      setError('');
      
      try {
        const docRef = doc(db, 'menuItems', itemId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const itemData = { id: docSnap.id, ...docSnap.data() };
          setItem(itemData);
          
          // Fetch related items in the same category
          const q = query(
            collection(db, 'menuItems'), 
            where('category', '==', itemData.category),
            limit(6)
          );
          const relatedSnap = await getDocs(q);
          const related = relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(d => d.id !== itemId); // Exclude current item
            
          setRelatedItems(related);
        } else {
          setError('Menu item not found.');
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setError('Failed to load menu item details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
    // Scroll to top when itemId changes
    window.scrollTo(0, 0);
  }, [itemId]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <UtensilsCrossed className="w-12 h-12 text-primary mb-4 opacity-50" />
          <p className="text-gray-500 font-serif text-lg">Preparing your table...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-serif font-bold text-dark mb-4">Item Not Found</h1>
        <p className="text-gray-600 mb-8">{error || "The menu item you're looking for doesn't exist."}</p>
        <Link to="/" className="px-6 py-3 bg-dark text-white rounded-none hover:bg-black transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-dark font-sans selection:bg-primary/20 pb-20">
      {/* Simple Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <Link to="/" className="font-serif text-xl font-bold text-primary tracking-tight">
            Bosphorus
          </Link>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </nav>

      {/* Main Details Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px] md:h-[600px] w-full"
          >
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover shadow-2xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center shadow-2xl">
                <UtensilsCrossed className="w-20 h-20 text-gray-400" />
              </div>
            )}
            
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 -z-10 hidden md:block"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-gray-200 -z-10 hidden md:block"></div>
          </motion.div>

          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-4">
              <span className="inline-block py-1 px-3 bg-gray-100 text-gray-600 text-xs font-bold tracking-wider uppercase">
                {item.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-dark mb-4 leading-tight">
              {item.title}
            </h1>
            
            <div className="text-3xl font-medium text-primary mb-8">
              ${Number(item.price).toFixed(2)}
            </div>
            
            <div className="prose prose-lg text-gray-600 mb-10">
              <p className="leading-relaxed">
                {item.description || "A delicious offering from our woodfire grill, prepared with the finest ingredients and authentic Anatolian techniques."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-10 py-6 border-y border-gray-200">
              <div className="flex items-start gap-3">
                <Flame className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-dark uppercase tracking-wider">Preparation</h4>
                  <p className="text-sm text-gray-500 mt-1">Oak Wood-Fired</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-dark uppercase tracking-wider">Serve Time</h4>
                  <p className="text-sm text-gray-500 mt-1">15-20 Minutes</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-dark text-white px-8 py-4 text-lg font-medium hover:bg-black transition-colors text-center"
            >
              Reserve a Table to Try This
            </button>
          </motion.div>
        </div>
      </main>

      {/* Related Items Carousel */}
      {relatedItems.length > 0 && (
        <section className="bg-white py-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-serif font-bold text-dark mb-2">More from {item.category}</h2>
                <p className="text-gray-600">Discover other favorites in this category.</p>
              </div>
              
              {/* Carousel Controls */}
              <div className="hidden sm:flex gap-2">
                <button 
                  onClick={() => scrollCarousel('left')}
                  className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scrollCarousel('right')}
                  className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Carousel Container */}
            <div 
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedItems.map((relatedItem, i) => (
                <motion.div 
                  key={relatedItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="min-w-[280px] md:min-w-[320px] max-w-[320px] snap-start group"
                >
                  <Link to={`/menu/${relatedItem.id}`} className="block h-full">
                    <div className="h-64 overflow-hidden bg-gray-100 mb-4">
                      {relatedItem.imageUrl ? (
                        <img 
                          src={relatedItem.imageUrl} 
                          alt={relatedItem.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors">
                      {relatedItem.title}
                    </h3>
                    <p className="text-primary font-medium mt-1">${Number(relatedItem.price).toFixed(2)}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ReservationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
