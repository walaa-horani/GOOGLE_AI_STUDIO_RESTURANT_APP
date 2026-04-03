import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, signInWithGoogle, logOut, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format } from 'date-fns';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [reservations, setReservations] = useState<any[]>([]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLoginError(err.message || "Failed to sign in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'reservations'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const resData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReservations(resData);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'reservations');
      });
      
      return () => unsubscribe();
    } else {
      setReservations([]);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await addDoc(collection(db, 'reservations'), {
        userId: user.uid,
        name: user.displayName || 'Guest',
        email: user.email || '',
        date,
        time,
        partySize: parseInt(partySize, 10),
        specialRequests,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
      setDate('');
      setTime('');
      setPartySize('2');
      setSpecialRequests('');
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
      
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'reservations');
      } catch (handledErr: any) {
        setError("Failed to make reservation. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-secondary w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-secondary z-10">
            <h2 className="text-2xl font-serif font-semibold text-primary">Reserve Your Table</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {loadingAuth ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">Please sign in to make a reservation and view your past bookings.</p>
                {loginError && <p className="text-red-600 text-sm mb-4">{loginError}</p>}
                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in with Google'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {success ? (
                  <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
                    <p className="font-medium">Reservation Request Sent!</p>
                    <p className="text-sm mt-1">We will confirm your table shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="date" 
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="time" 
                            required
                            min="11:30"
                            max="23:30"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Party Size</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select 
                          value={partySize}
                          onChange={(e) => setPartySize(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none"
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Special Requests (Optional)</label>
                      <textarea 
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Allergies, special occasions, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                      />
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Reservation'}
                    </button>
                  </form>
                )}

                {reservations.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-serif font-medium text-lg mb-4">Your Reservations</h3>
                    <div className="space-y-3">
                      {reservations.map(res => (
                        <div key={res.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center">
                          <div>
                            <p className="font-medium">{format(new Date(res.date), 'MMM d, yyyy')} at {res.time}</p>
                            <p className="text-sm text-gray-500">{res.partySize} {res.partySize === 1 ? 'Person' : 'People'}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                            res.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            res.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {res.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 text-center">
                  <button onClick={logOut} className="text-sm text-gray-500 hover:text-gray-800 underline">
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
