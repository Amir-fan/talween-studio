'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, User, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onPhotoSelect: (photoData: string) => void;
  onPhotoRemove: () => void;
  selectedPhoto?: string;
  className?: string;
}

export function PhotoUpload({ onPhotoSelect, onPhotoRemove, selectedPhoto, className }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(selectedPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صحيح');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onPhotoSelect(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('w-full', className)}>
      <Card 
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          dragActive 
            ? 'border-primary bg-primary/5' 
            : preview 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          {preview ? (
            <div className="relative">
              <div className="aspect-square max-w-xs mx-auto relative">
                <Image
                  src={preview}
                  alt="صورة الطفل المختارة"
                  fill
                  className="object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-green-600 font-medium">
                  ✅ تم اختيار صورة الطفل بنجاح
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  سيتم استخدام هذه الصورة كشخصية رئيسية في القصة
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {dragActive ? (
                  <Upload className="h-8 w-8 text-primary" />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                أضف صورة الطفل
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ارفع صورة واضحة لطفلك ليصبح البطل في القصة
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <ImageIcon className="h-4 w-4" />
                <span>JPG, PNG (حد أقصى 5 ميجابايت)</span>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
}
