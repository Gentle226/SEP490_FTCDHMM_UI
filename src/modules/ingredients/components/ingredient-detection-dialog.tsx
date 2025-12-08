'use client';

import { useMutation } from '@tanstack/react-query';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import { Checkbox } from '@/base/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';

import {
  IngredientDetectionResult,
  ingredientManagementService,
} from '../services/ingredient-management.service';

interface IngredientDetectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (selectedIngredients: string[]) => void;
}

export function IngredientDetectionDialog({
  open,
  onOpenChange,
  onSelect,
}: IngredientDetectionDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<IngredientDetectionResult[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(new Set());
  const [cameraActive, setCameraActive] = useState(false);

  const detectionMutation = useMutation({
    mutationFn: async (image: File) => {
      return ingredientManagementService.detectIngredientsFromImage(image);
    },
    onSuccess: (data) => {
      setDetectionResults(data);
      // Auto-select all by default (high confidence)
      const ingredientIds = data.map((d) => d.id);
      setSelectedIngredientIds(new Set(ingredientIds));
      toast.success(`Phát hiện được ${data.length} nguyên liệu`);
    },
    onError: (error: Error) => {
      console.error('Detection error:', error);
      const errorObj = error as {
        response?: { data?: { message?: string; statusCode?: number } };
        message?: string;
      };
      const statusCode = errorObj?.response?.data?.statusCode;
      const message = errorObj?.response?.data?.message || errorObj?.message || '';

      // Handle service unavailable (416)
      if (statusCode === 416) {
        toast.error('Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.');
        return;
      }

      // Show more helpful message for timeout errors
      if (message?.includes('timeout')) {
        toast.error('Quá trình phân tích mất quá lâu. Vui lòng thử lại.');
      } else {
        toast.error(message || 'Không thể phân tích ảnh');
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Reset previous results
      setDetectionResults([]);
      setSelectedIngredientIds(new Set());
    }
  };

  // Camera functions
  useEffect(() => {
    if (!cameraActive || !open || !videoRef.current) return;

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera error:', error);
        toast.error('Không thể truy cập camera');
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, open]);

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(canvasRef.current!.toDataURL('image/jpeg'));
        setCameraActive(false);
        setDetectionResults([]);
        setSelectedIngredientIds(new Set());
        toast.success('Chụp ảnh thành công');
      }
    }, 'image/jpeg');
  };

  const handleToggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  const handleDetect = async () => {
    if (!imageFile) {
      toast.error('Vui lòng chọn hình ảnh');
      return;
    }

    detectionMutation.mutate(imageFile);
  };

  const handleIngredientToggle = (ingredientId: string) => {
    const newSelected = new Set(selectedIngredientIds);
    if (newSelected.has(ingredientId)) {
      newSelected.delete(ingredientId);
    } else {
      newSelected.add(ingredientId);
    }
    setSelectedIngredientIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIngredientIds.size === detectionResults.length) {
      setSelectedIngredientIds(new Set());
    } else {
      const all = new Set(detectionResults.map((d) => d.id));
      setSelectedIngredientIds(all);
    }
  };

  const handleConfirm = () => {
    if (selectedIngredientIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất một nguyên liệu');
      return;
    }

    // Pass the selected ingredient IDs to the callback
    onSelect?.(Array.from(selectedIngredientIds));
    resetDialog();
    onOpenChange(false);
  };

  const resetDialog = () => {
    setImageFile(null);
    setImagePreview(null);
    setDetectionResults([]);
    setSelectedIngredientIds(new Set());
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.75) return 'bg-blue-100 text-blue-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#99b94a]">Quét Nguyên Liệu</DialogTitle>
          <DialogDescription>
            Chụp hoặc import ảnh để AI phân tích và tìm nguyên liệu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload Section */}
          {detectionResults.length === 0 && (
            <div className="space-y-4">
              {cameraActive ? (
                // Camera Mode
                <div className="space-y-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-64 w-full rounded-lg bg-black object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCapturePhoto}
                      className="flex-1 bg-[#99b94a] hover:bg-[#88a839]"
                    >
                      <Camera className="mr-2 size-4" />
                      Chụp ảnh
                    </Button>
                    <Button onClick={handleToggleCamera} variant="outline" className="flex-1">
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                // Upload Mode
                <div className="flex justify-center">
                  {imagePreview ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => document.getElementById('detection-image-upload')?.click()}
                        className="group relative rounded-lg border-2 border-dashed border-gray-300 p-0 transition-colors hover:border-[#99b94a]"
                        title="Click để thay đổi ảnh"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="size-48 rounded-lg object-cover group-hover:opacity-75"
                          onError={(e) => {
                            console.warn('Image load error:', imagePreview);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <Upload className="size-8 text-[#99b94a]" />
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-3 -right-3 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                        aria-label="Remove image"
                        title="Xóa ảnh"
                      >
                        <X className="size-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById('detection-image-upload')?.click()}
                      className="group flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-[#99b94a]"
                      title="Click để tải ảnh lên"
                    >
                      <Upload className="text-muted-foreground mb-2 size-8 group-hover:text-[#99b94a]" />
                      <span className="text-sm text-gray-500 group-hover:text-[#99b94a]">
                        Nhấn để tải ảnh
                      </span>
                    </button>
                  )}
                  <input
                    type="file"
                    id="detection-image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-label="Upload image for detection"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleDetect}
                  disabled={!imageFile || detectionMutation.isPending}
                  className="flex-1 bg-[#99b94a] hover:bg-[#88a839]"
                >
                  {detectionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    'Phân tích ảnh'
                  )}
                </Button>
                <Button
                  onClick={handleToggleCamera}
                  variant="outline"
                  className="border-[#99b94a] text-[#99b94a] hover:bg-[#99b94a]/10"
                  disabled={cameraActive}
                  title={cameraActive ? 'Đang mở camera' : 'Chụp ảnh trực tiếp'}
                >
                  <Camera className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Detection Results Section */}
          {detectionResults.length > 0 && (
            <div className="space-y-4">
              {/* Select All Button */}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIngredientIds.size === detectionResults.length}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                  className="border-[#99b94a]"
                />
                <label htmlFor="select-all" className="cursor-pointer font-medium">
                  Chọn tất cả ({selectedIngredientIds.size}/{detectionResults.length})
                </label>
              </div>

              {/* Results List */}
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                {detectionResults.map((result, index) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3"
                  >
                    <Checkbox
                      checked={selectedIngredientIds.has(result.id)}
                      onCheckedChange={() => handleIngredientToggle(result.id)}
                      id={`ingredient-${index}`}
                      className="border-[#99b94a]"
                    />
                    <label
                      htmlFor={`ingredient-${index}`}
                      className="flex flex-1 cursor-pointer items-center justify-between"
                    >
                      <span className="font-medium">{result.ingredient}</span>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${getConfidenceColor(result.confidence)}`}
                      >
                        {(result.confidence * 100).toFixed(0)}%
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>

              {/* Upload New Image Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setDetectionResults([]);
                  setSelectedIngredientIds(new Set());
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="w-full"
              >
                ← Quay lại chọn ảnh
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            {detectionResults.length > 0 && (
              <Button onClick={handleConfirm} className="bg-[#99b94a] hover:bg-[#88a839]">
                Tìm kiếm ({selectedIngredientIds.size} nguyên liệu)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
