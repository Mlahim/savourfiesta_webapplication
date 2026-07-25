import React from "react";

const MenuCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row md:flex-col h-[9.5rem] md:h-full animate-pulse">
      {/* Image Section */}
      <div className="w-32 sm:w-36 md:w-full flex-shrink-0 md:h-48 bg-gray-200"></div>
      
      {/* Content Section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-1 hidden sm:block"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6 hidden sm:block"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 md:hidden mb-1"></div>
        </div>
        
        <div className="mt-auto md:space-y-3">
          <div className="flex flex-col md:gap-3">
            <div className="flex items-center justify-between mb-2 md:mb-0">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="w-20 h-6 md:h-8 bg-gray-200 rounded-md"></div>
            </div>
            <div className="w-full h-8 md:h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCardSkeleton;
