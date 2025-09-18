'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/context/library-context';
import { useToast } from '@/hooks/use-toast';

interface HeartButtonProps {
  item: {
    type: 'story' | 'text-to-coloring' | 'image-to-coloring';
    title: string;
    description: string;
    imageDataUri: string;
    pages?: Array<{
      text: string;
      imageDataUri: string;
    }>;
    originalImageDataUri?: string;
    childName?: string;
    ageGroup?: string;
    setting?: string;
    lesson?: string;
    difficulty?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function HeartButton({ item, size = 'md', variant = 'ghost' }: HeartButtonProps) {
  const { addToLibrary, removeFromLibrary, isInLibrary } = useLibrary();
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  // Create a unique ID for this item based on its content
  const itemId = `${item.type}_${item.title}_${item.imageDataUri.slice(-10)}`;

  const isHearted = isInLibrary(itemId);

  const handleHeartClick = () => {
    if (isHearted) {
      removeFromLibrary(itemId);
      toast({
        title: "تمت الإزالة من المكتبة",
        description: "تم إزالة العنصر من مكتبتك الشخصية",
      });
    } else {
      addToLibrary(item);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      toast({
        title: "تمت الإضافة إلى المكتبة",
        description: "تم حفظ العنصر في مكتبتك الشخصية",
      });
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleHeartClick}
      className={`${sizeClasses[size]} transition-all duration-300 ${
        isHearted 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
      } ${isAnimating ? 'animate-pulse scale-110' : ''}`}
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-300 ${
          isHearted ? 'fill-current' : ''
        }`} 
      />
    </Button>
  );
}
