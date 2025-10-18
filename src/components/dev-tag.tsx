'use client';

import { useState } from 'react';
import { X, ExternalLink, Phone, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DevTag() {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => {
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  return (
    <>
      {/* Dev Tag Button */}
      <div className="flex justify-center mt-4">
        <Button
          onClick={openPopup}
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 text-xs px-3 py-1.5 rounded-full font-medium"
        >
          <span className="text-[10px] mr-1">Dev</span>
          صمم من قبل فنري لابز
        </Button>
      </div>

      {/* Popup Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Fanari Labs</h3>
                  <p className="text-sm text-gray-500">AI Agency</p>
                </div>
              </div>
              <Button
                onClick={closePopup}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <a
                    href="tel:+905379295163"
                    className="hover:text-blue-600 transition-colors"
                  >
                    +90 537 929 51 63
                  </a>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <a
                    href="mailto:fanarilabs@gmail.com"
                    className="hover:text-blue-600 transition-colors"
                  >
                    fanarilabs@gmail.com
                  </a>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <a
                    href="https://fanarilabs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    fanarilabs.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600 text-center">
                  متخصصون في تطوير حلول الذكاء الاصطناعي المبتكرة
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <Button
                onClick={closePopup}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
