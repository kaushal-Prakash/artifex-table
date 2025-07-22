import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 py-3 shadow-md flex justify-center items-center rounded-b-2xl">
            <h1 className="text-white text-4xl font-semibold tracking-wider">
                Artifex Table
            </h1>
        </header>
    );
};

export default Header;