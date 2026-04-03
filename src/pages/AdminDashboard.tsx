import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth, logOut, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format } from 'date-fns';
import { Loader2, Trash2, Image as ImageIcon, LogOut, Plus, CheckCircle, XCircle, Clock, UtensilsCrossed } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservations' | 'menu'>('reservations');
  const navigate = useNavigate();

  // Reservations State
  const [reservations, setReservations] = useState<any[]>([]);
  
  // Menu State
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [newMenu, setNewMenu] = useState({ title: '', description: '', price: '', category: 'Mains' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [menuError, setMenuError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && u.email === 'walaahorani09@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isAdmin) {
      // Fetch Reservations
      const qRes = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
      const unsubRes = onSnapshot(qRes, (snap) => {
        setReservations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'reservations'));

      // Fetch Menu Items
      const qMenu = query(collection(db, 'menuItems'), orderBy('createdAt', 'desc'));
      const unsubMenu = onSnapshot(qMenu, (snap) => {
        setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'menuItems'));

      return () => {
        unsubRes();
        unsubMenu();
      };
    }
  }, [isAdmin]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reservations/${id}`);
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenu.title || !newMenu.price) return;
    
    setIsUploading(true);
    setMenuError('');
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `menuItems/${Date.now()}_${imageFile.name}`);
        // Add a timeout to prevent infinite hang if Storage isn't initialized
        await Promise.race([
          uploadBytes(storageRef, imageFile),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Image upload timed out. Please make sure Firebase Storage is initialized in your Firebase Console.')), 15000))
        ]);
        imageUrl = await getDownloadURL(storageRef);
      }

      const itemData: any = {
        title: newMenu.title,
        price: parseFloat(newMenu.price),
        category: newMenu.category,
        createdAt: serverTimestamp()
      };
      
      if (newMenu.description) itemData.description = newMenu.description;
      if (imageUrl) itemData.imageUrl = imageUrl;

      await addDoc(collection(db, 'menuItems'), itemData);

      setNewMenu({ title: '', description: '', price: '', category: 'Mains' });
      setImageFile(null);
      setIsAddingMenu(false);
    } catch (error: any) {
      console.error("Add menu error:", error);
      setMenuError(error.message || "Failed to add menu item. Check console for details.");
      try {
        handleFirestoreError(error, OperationType.CREATE, 'menuItems');
      } catch (e) {
        // Ignore the throw from handleFirestoreError so we can still see the UI error
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'menuItems', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `menuItems/${id}`);
      }
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4 text-center">
        <h1 className="text-3xl font-serif font-bold text-dark mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">You do not have permission to view this page. Please sign in with the owner account.</p>
        <div className="flex gap-4">
          <Link to="/" className="px-6 py-2 bg-dark text-white rounded hover:bg-black transition-colors">Return Home</Link>
          {!user ? (
            <button 
              onClick={async () => {
                try {
                  const { signInWithGoogle } = await import('../firebase');
                  await signInWithGoogle();
                } catch (e) {
                  console.error(e);
                }
              }} 
              className="px-6 py-2 border border-dark text-dark rounded hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
          ) : (
            <button onClick={logOut} className="px-6 py-2 border border-dark text-dark rounded hover:bg-gray-100 transition-colors">Sign Out</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-dark text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-serif font-bold text-primary">Admin Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Bosphorus Grill</p>
        </div>
        <div className="flex-1 py-6">
          <nav className="space-y-1 px-3">
            <button 
              onClick={() => setActiveTab('reservations')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'reservations' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <Clock className="w-5 h-5" />
              Reservations
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'menu' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <UtensilsCrossed className="w-5 h-5" />
              Menu Items
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 px-2">
            &larr; Back to Website
          </Link>
          <button onClick={() => { logOut(); navigate('/'); }} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 px-2 w-full">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'reservations' && (
          <div>
            <h1 className="text-3xl font-serif font-bold text-dark mb-8">Reservations</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Guest</th>
                      <th className="px-6 py-4 font-medium">Date & Time</th>
                      <th className="px-6 py-4 font-medium">Party Size</th>
                      <th className="px-6 py-4 font-medium">Requests</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservations.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No reservations found.</td></tr>
                    ) : reservations.map(res => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-dark">{res.name}</div>
                          <div className="text-gray-500 text-xs">{res.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{res.date}</div>
                          <div className="text-gray-500 text-xs">{res.time}</div>
                        </td>
                        <td className="px-6 py-4">{res.partySize}</td>
                        <td className="px-6 py-4 max-w-xs truncate text-gray-500" title={res.specialRequests}>
                          {res.specialRequests || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              res.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select 
                            value={res.status}
                            onChange={(e) => handleStatusChange(res.id, e.target.value)}
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirm</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-dark">Menu Items</h1>
              <button 
                onClick={() => setIsAddingMenu(!isAddingMenu)}
                className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-hover transition-colors flex items-center gap-2"
              >
                {isAddingMenu ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isAddingMenu ? 'Cancel' : 'Add Item'}
              </button>
            </div>

            {isAddingMenu && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h3 className="text-lg font-bold mb-4">Add New Menu Item</h3>
                {menuError && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {menuError}
                  </div>
                )}
                <form onSubmit={handleAddMenuItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input type="text" required value={newMenu.title} onChange={e => setNewMenu({...newMenu, title: e.target.value})} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                      <input type="number" step="0.01" required value={newMenu.price} onChange={e => setNewMenu({...newMenu, price: e.target.value})} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={newMenu.category} onChange={e => setNewMenu({...newMenu, category: e.target.value})} className="w-full p-2 border rounded-md">
                        <option>Starters</option>
                        <option>Mains</option>
                        <option>Desserts</option>
                        <option>Drinks</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                      <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full p-1.5 border rounded-md text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={2} value={newMenu.description} onChange={e => setNewMenu({...newMenu, description: e.target.value})} className="w-full p-2 border rounded-md resize-none" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={isUploading} className="bg-dark text-white px-6 py-2 rounded-md font-medium hover:bg-black transition-colors flex items-center gap-2">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Save Item
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-100 relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold text-dark shadow">
                      ${item.price}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-dark">{item.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">{item.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button onClick={() => handleDeleteMenuItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && !isAddingMenu && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-200 border-dashed">
                  No menu items found. Click "Add Item" to create one.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
