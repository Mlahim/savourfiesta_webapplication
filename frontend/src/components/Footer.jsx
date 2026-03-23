import React from 'react';
import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 pt-10 pb-6">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Brand Column */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-orange-500">Savour</span>Fiesta
                        </h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Experience the finest culinary delights delivered to your doorstep. Quality ingredients, exceptional taste.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>



                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-orange-500 mt-1 shrink-0" size={18} />
                                <span>Khanewal</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-orange-500 shrink-0" size={18} />
                                <span>03019090311</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-orange-500 shrink-0" size={18} />
                                <span>savourfiestaofficial@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Opening Hours</h4>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center pb-2 border-b border-gray-800">
                                <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Mon - Fri</span>
                                <span className="text-orange-500 font-medium">09:00 - 22:00</span>
                            </li>
                            <li className="flex justify-between items-center pb-2 border-b border-gray-800">
                                <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Saturday</span>
                                <span className="text-orange-500 font-medium">10:00 - 23:00</span>
                            </li>
                            <li className="flex justify-between items-center pb-2 border-b border-gray-800">
                                <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Sunday</span>
                                <span className="text-orange-500 font-medium">10:00 - 21:00</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {currentYear} SavourFiesta. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">
                        Designed & Developed by{' '}
                        <a 
                            href="https://www.muhammadmlahim.me/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
                        >
                            Muhammad Mlahim
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
