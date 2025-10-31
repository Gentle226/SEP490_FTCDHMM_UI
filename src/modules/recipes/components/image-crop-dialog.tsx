'use client';

import { Crop } from 'lucide-react';
import { useCallback, useState } from 'react';
import ReactEasyCrop, { Area, Point } from 'react-easy-crop';

import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Slider } from '@/base/components/ui/slider';

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
}

async function getCroppedImage(imageSrc: string, croppedArea: Area): Promise<File> {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = croppedArea.width;
      canvas.height = croppedArea.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(
        image,
        croppedArea.x * scaleX,
        croppedArea.y * scaleY,
        croppedArea.width * scaleX,
        croppedArea.height * scaleY,
        0,
        0,
        croppedArea.width,
        croppedArea.height,
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not crop image'));
          return;
        }
        const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    };

    image.onerror = () => {
      reject(new Error('Could not load image'));
    };
  });
}

export function ImageCropDialog({
  open,
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropAreaChange = useCallback((_croppedArea: Area, _croppedAreaPixels: Area) => {
    setCroppedArea(_croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;

    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImage(imageSrc, croppedArea);
      onCropComplete(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Cắt ảnh
          </DialogTitle>
          <DialogDescription>Điều chỉnh ảnh của bạn theo ý thích</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Crop Area */}
          <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-100">
            <ReactEasyCrop
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid
              objectFit="contain"
              onCropChange={setCrop}
              onCropAreaChange={handleCropAreaChange}
              onZoomChange={setZoom}
            />
          </div>

          {/* Zoom Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phóng to / Thu nhỏ</label>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full pt-3"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Hủy
            </Button>
            <Button onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
