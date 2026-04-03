import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, MessageCircle, Mail, Clock, Flame, Leaf, UtensilsCrossed, Star, ChevronRight, Menu, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import FirebaseImage from '../components/FirebaseImage';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'menuItems'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(items);
    });
    return () => unsubscribe();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayMenu = menuItems.length > 0 ? menuItems : [
    {
      title: "Wood-Fired Kebabs",
      description: "Hand-minced and marinated daily, grilled to perfection over oak embers.",
      imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=1935&auto=format&fit=crop"
    },
    {
      title: "Dry-Aged Steaks",
      description: "Premium cuts aged in-house, seared at high heat to lock in the rich flavors.",
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Fresh Daily Meze",
      description: "A vibrant assortment of seasonal cold and warm starters to share.",
      imageUrl: "https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-secondary text-dark font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-secondary/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="font-serif text-xl md:text-2xl font-bold text-primary tracking-tight">
            Bosphorus Woodfire Grill
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('about')} className="text-sm font-medium hover:text-primary transition-colors">About</button>
            <button onClick={() => scrollToSection('menu')} className="text-sm font-medium hover:text-primary transition-colors">Menu</button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-medium hover:text-primary transition-colors">Contact</button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-none font-medium hover:bg-primary-hover transition-colors"
            >
              Reserve Table
            </button>
            <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Admin</Link>
          </div>
          <button className="md:hidden p-2 text-dark">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FirebaseImage 
            storagePath="images/hero.jpg"
            fallbackSrc="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop" 
            alt="Woodfire Grill" 
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/95 to-secondary"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 tracking-wide uppercase">
              Kadıköy, Istanbul
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-dark mb-6 leading-tight">
              Authentic Anatolian Flavors, <br/><span className="text-primary italic">Modern Istanbul Vibe.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the rich heritage of Turkish grill culture, elevated with premium local ingredients and cooked exclusively over open oak wood flames.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-none font-medium text-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                Reserve Your Table
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollToSection('menu')}
                className="w-full sm:w-auto bg-transparent border border-dark text-dark px-8 py-4 rounded-none font-medium text-lg hover:bg-dark hover:text-white transition-colors"
              >
                View Full Menu
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span>Top Rated in Kadıköy</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <span>100% Oak Wood-Fire</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px]"
            >
              <FirebaseImage 
                storagePath="images/about-interior.jpg"
                fallbackSrc="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop" 
                alt="Restaurant Interior" 
                className="w-full h-full object-cover rounded-none"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary border-8 border-white hidden md:block">
                <FirebaseImage 
                  storagePath="images/about-grill.jpg"
                  fallbackSrc="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop" 
                  alt="Grill" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:pl-10"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-dark">The Heart of Kadıköy</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Located in the vibrant heart of Kadıköy, Bosphorus Woodfire Grill brings a contemporary touch to traditional Turkish grill culture. 
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                We source premium local ingredients daily and cook exclusively over open oak wood flames to deliver unforgettable, rich flavors in a warm, elegantly designed space. Whether you're joining us for a casual dinner or a special celebration, our cozy terrace and inviting dining room provide the perfect backdrop.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-none text-primary">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark">100% Oak Wood-Fire</h4>
                    <p className="text-sm text-gray-500 mt-1">Authentic smoky flavor in every bite.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-none text-primary">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark">Farm-to-Table</h4>
                    <p className="text-sm text-gray-500 mt-1">Seasonal ingredients sourced locally.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services / Menu Highlights */}
      <section id="menu" className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-dark">Our Specialties</h2>
            <p className="text-gray-600 text-lg">A curated selection of Anatolian classics, perfected over the open flame.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {displayMenu.map((item, i) => (
              <motion.div 
                key={item.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  to={item.id ? `/menu/${item.id}` : `#`} 
                  className={`bg-white group overflow-hidden block h-full ${item.id ? 'hover:shadow-xl transition-shadow' : ''}`}
                >
                  <div className="h-64 overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <UtensilsCrossed className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 text-center border border-t-0 border-gray-100 relative h-full">
                    <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                    {item.price && (
                      <p className="text-primary font-semibold text-lg">${Number(item.price).toFixed(2)}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-16">
            <h3 className="text-2xl font-serif font-bold text-center mb-10">More Than Just Dinner</h3>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="p-6">
                <UtensilsCrossed className="w-8 h-8 mx-auto text-primary mb-4" />
                <h4 className="font-bold mb-2">Weekend Brunch</h4>
                <p className="text-sm text-gray-600">A lavish Turkish breakfast spread every Saturday and Sunday.</p>
              </div>
              <div className="p-6">
                <Users className="w-8 h-8 mx-auto text-primary mb-4" />
                <h4 className="font-bold mb-2">Private Dining</h4>
                <p className="text-sm text-gray-600">Exclusive spaces for your special celebrations and events.</p>
              </div>
              <div className="p-6">
                <Clock className="w-8 h-8 mx-auto text-primary mb-4" />
                <h4 className="font-bold mb-2">Corporate Catering</h4>
                <p className="text-sm text-gray-600">Bring the Bosphorus experience to your next business gathering.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Guest Experiences</h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-dark-muted p-8 rounded-none relative"
            >
              <div className="flex text-primary mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg italic text-gray-300 mb-6">"The best Iskender I've had on the Asian side. The atmosphere is incredibly warm and modern."</p>
              <p className="font-medium">— Ahmet Y.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-dark-muted p-8 rounded-none relative"
            >
              <div className="flex text-primary mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg italic text-gray-300 mb-6">"Perfect spot for a dinner date. The mezes are fresh and the service is top-notch."</p>
              <p className="font-medium">— Sarah M.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-dark">Visit Us</h2>
              <p className="text-gray-600 mb-10">Join us in Kadıköy for an unforgettable dining experience. We recommend making a reservation, especially for weekend evenings.</p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-dark">Location</h4>
                    <p className="text-gray-600 mt-1">Caferağa Mah. Moda Cd. No: 123<br/>Kadıköy, Istanbul, Türkiye</p>
                    <a href="https://goo.gl/maps/bosphorus-grill-demo" target="_blank" rel="noopener noreferrer" className="text-primary font-medium text-sm hover:underline mt-2 inline-block">Get Directions</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-dark">Hours</h4>
                    <p className="text-gray-600 mt-1">Monday - Sunday<br/>11:30 AM - 11:30 PM</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:+902165550123" 
                  className="flex-1 bg-dark text-white px-6 py-3 rounded-none font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
                <a 
                  href="https://wa.me/905325550199" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white px-6 py-3 rounded-none font-medium hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>
            </div>
            
            <div className="h-[400px] md:h-auto bg-gray-200 relative overflow-hidden">
              <iframe 
                src="https://maps.google.com/maps?q=Cafera%C4%9Fa%20Mah.%20Moda%20Cd.%20No%3A%20123%20Kad%C4%B1k%C3%B6y%2C%20Istanbul&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Restaurant Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-4">Bosphorus Woodfire Grill</h3>
              <p className="text-sm max-w-xs">Authentic Anatolian Flavors, Modern Istanbul Vibe.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="tel:+902165550123" className="hover:text-white transition-colors">+90 216 555 0123</a></li>
                <li><a href="mailto:reservations@bosphoruswoodfire.com" className="hover:text-white transition-colors">reservations@bosphoruswoodfire.com</a></li>
                <li>Caferağa Mah. Moda Cd. No: 123, Kadıköy</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Reservations</h4>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-primary hover:text-white transition-colors font-medium"
              >
                Book a Table Online &rarr;
              </button>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Bosphorus Woodfire Grill. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Reservation Modal */}
      <ReservationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
