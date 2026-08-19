import React from 'react';

const Avatar = ({ name, size = 'md' }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}>
      {initial}
    </div>
  );
};

export default Avatar;
