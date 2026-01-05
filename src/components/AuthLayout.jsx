import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/30"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;