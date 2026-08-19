import React from 'react';

const Badge = ({ children, status }) => {
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  
  switch (status?.toLowerCase()) {
    case 'new':
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'contacted':
      colorClass = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
    case 'qualified':
      colorClass = 'bg-green-50 text-green-700 border-green-200';
      break;
    case 'converted':
      colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'lost':
      colorClass = 'bg-red-50 text-red-700 border-red-200';
      break;
    default:
      break;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {children}
    </span>
  );
};

export default Badge;
