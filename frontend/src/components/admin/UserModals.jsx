import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ModalBackdrop = ({ children, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
        {children}
    </motion.div>
);

const ModalContent = ({ children, title, onClose }) => (
    <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
    >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>
        {children}
    </motion.div>
);

export const AddUserModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        is_superuser: false,
        is_active: true
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalBackdrop onClose={onClose}>
                    <ModalContent title="Add New User" onClose={onClose}>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="John Doe"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Shield size={20} className="text-purple-600 dark:text-purple-400" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Admin Privileges</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_superuser}
                                            onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Active Account</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating..." : "Create User"}
                            </button>
                        </form>
                    </ModalContent>
                </ModalBackdrop>
            )}
        </AnimatePresence>
    );
};

export const EditUserModal = ({ isOpen, onClose, onSubmit, isLoading, user }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        is_superuser: false,
        is_active: true
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                password: '',
                is_superuser: user.is_superuser,
                is_active: user.is_active
            });
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = { ...formData };
        if (!dataToSubmit.password) delete dataToSubmit.password;
        onSubmit(user.id, dataToSubmit);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalBackdrop onClose={onClose}>
                    <ModalContent title={`Edit ${user.full_name || user.email}`} onClose={onClose}>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        New Password <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
                                    <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                                <Shield size={20} />
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Admin Privileges</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_superuser}
                                                onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                                {formData.is_active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Active Account</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </ModalContent>
                </ModalBackdrop>
            )}
        </AnimatePresence>
    );
};

export const DeleteUserModal = ({ isOpen, onClose, onSubmit, isLoading, user }) => {
    if (!isOpen || !user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalBackdrop onClose={onClose}>
                    <ModalContent title="Delete User" onClose={onClose}>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <XCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold">Warning</h4>
                                    <p className="text-sm">This action cannot be undone.</p>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to permanently delete <strong>{user.email}</strong>?
                                All associated data (links, analytics) will be removed.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSubmit(user.id)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                                >
                                    {isLoading ? "Deleting..." : "Delete User"}
                                </button>
                            </div>
                        </div>
                    </ModalContent>
                </ModalBackdrop>
            )}
        </AnimatePresence>
    );
};
