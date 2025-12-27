'use client';

import {
  ArrowDown,
  ArrowUp,
  Beef,
  Clock,
  Dessert,
  Drumstick,
  Edit,
  GripVertical,
  Info,
  Plus,
  Salad,
  Sandwich,
  Soup,
  Sparkles,
  Trash2,
  Utensils,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/base/components/ui/alert-dialog';
import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { Skeleton } from '@/base/components/ui/skeleton';
import { Slider } from '@/base/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/base/components/ui/tooltip';
import { useAuth } from '@/modules/auth';
import { MealSlotRequest, MealSlotResponse, mealSlotService } from '@/modules/meal-slots';

// Helper to get meal icon and color based on name/index
const getMealStyle = (name: string, index: number) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('sáng') || lowerName.includes('breakfast')) {
    return {
      gradient: 'from-amber-400 to-orange-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      icon: Dessert,
    };
  }
  if (lowerName.includes('trưa') || lowerName.includes('lunch')) {
    return {
      gradient: 'from-green-400 to-emerald-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      icon: Sandwich,
    };
  }
  if (lowerName.includes('chiều') || lowerName.includes('snack')) {
    return {
      gradient: 'from-blue-400 to-indigo-500',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-600',
      icon: UtensilsCrossed,
    };
  }
  if (lowerName.includes('tối') || lowerName.includes('dinner')) {
    return {
      gradient: 'from-indigo-400 to-purple-500',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      icon: Soup,
    };
  }
  if (lowerName.includes('phụ') || lowerName.includes('snack')) {
    return {
      gradient: 'from-pink-400 to-rose-500',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-600',
      icon: UtensilsCrossed,
    };
  }
  // Default colors based on index
  const colors = [
    {
      gradient: 'from-cyan-400 to-blue-500',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      icon: Salad,
    },
    {
      gradient: 'from-violet-400 to-purple-500',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      icon: Beef,
    },
    {
      gradient: 'from-teal-400 to-green-500',
      bgLight: 'bg-teal-50',
      textColor: 'text-teal-600',
      icon: Drumstick,
    },
  ];
  return colors[index % colors.length];
};

export default function MealSlotsPage() {
  const { user } = useAuth();
  const [mealSlots, setMealSlots] = useState<MealSlotResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MealSlotResponse | null>(null);

  // Form states
  const [formData, setFormData] = useState<MealSlotRequest>({
    name: '',
    energyPercent: 25,
    orderIndex: 1,
  });

  // Fetch meal slots
  const fetchMealSlots = async () => {
    try {
      setIsLoading(true);
      const slots = await mealSlotService.getMealSlots();
      setMealSlots(slots);
    } catch (error) {
      console.error('Error fetching meal slots:', error);
      toast.error('Không thể tải danh sách bữa ăn');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMealSlots();
    }
  }, [user]);

  // Calculate total energy percent
  const totalEnergyPercent = mealSlots.reduce((sum, slot) => sum + slot.energyPercent, 0);

  // Get next available order index
  const getNextOrderIndex = () => {
    if (mealSlots.length === 0) return 1;
    return Math.max(...mealSlots.map((s) => s.orderIndex)) + 1;
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên bữa ăn');
      return;
    }

    if (formData.energyPercent < 1 || formData.energyPercent > 100) {
      toast.error('Phần trăm năng lượng phải từ 1% đến 100%');
      return;
    }

    const newTotal = totalEnergyPercent + formData.energyPercent;
    if (newTotal > 100) {
      toast.error(
        `Tổng năng lượng không được vượt quá 100% (hiện tại: ${totalEnergyPercent.toFixed(0)}%)`,
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await mealSlotService.createMealSlot(formData);
      toast.success('Đã tạo bữa ăn mới');
      setShowCreateDialog(false);
      fetchMealSlots();
    } catch (error) {
      console.error('Error creating meal slot:', error);
      toast.error('Không thể tạo bữa ăn');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedSlot) return;

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên bữa ăn');
      return;
    }

    if (formData.energyPercent < 1 || formData.energyPercent > 100) {
      toast.error('Phần trăm năng lượng phải từ 1% đến 100%');
      return;
    }

    const otherSlotsTotal = mealSlots
      .filter((s) => s.id !== selectedSlot.id)
      .reduce((sum, slot) => sum + slot.energyPercent, 0);

    if (otherSlotsTotal + formData.energyPercent > 100) {
      toast.error(`Tổng năng lượng không được vượt quá 100%`);
      return;
    }

    try {
      setIsSubmitting(true);
      await mealSlotService.updateMealSlot(selectedSlot.id, formData);
      toast.success('Đã cập nhật bữa ăn');
      setShowEditDialog(false);
      fetchMealSlots();
    } catch (error) {
      console.error('Error updating meal slot:', error);
      toast.error('Không thể cập nhật bữa ăn');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedSlot) return;

    try {
      setIsSubmitting(true);
      await mealSlotService.deleteMealSlot(selectedSlot.id);
      toast.success('Đã xóa bữa ăn');
      setShowDeleteDialog(false);
      setSelectedSlot(null);
      fetchMealSlots();
    } catch (error) {
      console.error('Error deleting meal slot:', error);
      toast.error('Không thể xóa bữa ăn');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setFormData({
      name: '',
      energyPercent: 25,
      orderIndex: getNextOrderIndex(),
    });
    setShowCreateDialog(true);
  };

  // Open edit dialog
  const openEditDialog = (slot: MealSlotResponse) => {
    setSelectedSlot(slot);
    setFormData({
      name: slot.name,
      energyPercent: slot.energyPercent,
      orderIndex: slot.orderIndex,
    });
    setShowEditDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (slot: MealSlotResponse) => {
    setSelectedSlot(slot);
    setShowDeleteDialog(true);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-gray-500">Vui lòng đăng nhập để quản lý bữa ăn</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        {/* Header Card */}
        <Card className="border-0 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                  <Utensils className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-800">Quản lý Bữa ăn</CardTitle>
                  <CardDescription className="mt-1">
                    Tùy chỉnh các bữa ăn trong ngày theo nhu cầu của bạn
                  </CardDescription>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    asChild
                    style={{ '--tooltip-fill': '#99b94a' } as React.CSSProperties}
                  >
                    <Button
                      onClick={openCreateDialog}
                      className="gap-2 bg-gradient-to-r from-[#99b94a] to-[#7a8f3a] shadow-lg shadow-green-500/20 transition-all hover:shadow-green-500/40"
                      disabled={totalEnergyPercent >= 100}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Thêm bữa ăn</span>
                    </Button>
                  </TooltipTrigger>
                  {totalEnergyPercent >= 100 && (
                    <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                      <p>Đã phân bổ hết 100% năng lượng</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
        </Card>

        {/* Energy Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Phân bổ năng lượng hàng ngày</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tổng đã phân bổ</span>
                <Badge
                  variant={
                    totalEnergyPercent > 100
                      ? 'danger'
                      : totalEnergyPercent === 100
                        ? 'success'
                        : 'warning'
                  }
                >
                  {totalEnergyPercent.toFixed(0)}% / 100%
                </Badge>
              </div>

              {/* Visual Progress Bar with Segments */}
              <div className="relative">
                <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                  <div className="flex h-full">
                    {mealSlots
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((slot, idx) => {
                        const style = getMealStyle(slot.name, idx);
                        return (
                          <TooltipProvider key={slot.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`h-full bg-gradient-to-r ${style.gradient} transition-all first:rounded-l-full last:rounded-r-full`}
                                  style={{ width: `${slot.energyPercent}%` }}
                                />
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                                <p>
                                  {slot.name}: {slot.energyPercent.toFixed(0)}%
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3">
                {mealSlots
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((slot, idx) => {
                    const style = getMealStyle(slot.name, idx);
                    return (
                      <div key={slot.id} className="flex items-center gap-1.5">
                        <div
                          className={`h-3 w-3 rounded-full bg-gradient-to-r ${style.gradient}`}
                        />
                        <span className="text-xs text-gray-600">
                          {slot.name} ({slot.energyPercent.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                {totalEnergyPercent < 100 && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-gray-200" />
                    <span className="text-xs text-gray-400">
                      Chưa phân bổ ({(100 - totalEnergyPercent).toFixed(0)}%)
                    </span>
                  </div>
                )}
              </div>

              {totalEnergyPercent < 100 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-700">
                    Bạn còn <strong>{(100 - totalEnergyPercent).toFixed(0)}%</strong> năng lượng
                    chưa được phân bổ. Hãy thêm bữa ăn hoặc điều chỉnh phần trăm để tối ưu hóa chế
                    độ ăn.
                  </p>
                </div>
              )}

              {totalEnergyPercent === 100 && (
                <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <p className="text-sm text-green-700">
                    Tuyệt vời! Bạn đã phân bổ hoàn hảo 100% năng lượng cho các bữa ăn trong ngày.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meal Slots List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <CardTitle className="text-base">Danh sách bữa ăn</CardTitle>
              </div>
              <Badge variant="outline">{mealSlots.length} bữa ăn</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                  </div>
                ))
              ) : mealSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white py-16">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Salad className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">Chưa có bữa ăn nào</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Nhấn nút &quot;Thêm bữa ăn&quot; để bắt đầu tùy chỉnh
                  </p>
                  <Button
                    onClick={openCreateDialog}
                    className="mt-4 gap-2 bg-[#99b94a] hover:bg-[#7a8f3a]"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm bữa ăn đầu tiên
                  </Button>
                </div>
              ) : (
                mealSlots
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((slot, idx) => {
                    const style = getMealStyle(slot.name, idx);
                    return (
                      <div
                        key={slot.id}
                        className={`group flex items-center gap-4 rounded-xl border border-gray-100 ${style.bgLight} p-4 transition-all hover:border-gray-200 hover:shadow-md`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} shadow-lg`}
                          >
                            {<style.icon className="h-7 w-7 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">{slot.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              #{slot.orderIndex}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Zap className={`h-4 w-4 ${style.textColor}`} />
                              <span className={`text-sm font-medium ${style.textColor}`}>
                                {slot.energyPercent.toFixed(0)}%
                              </span>
                              <span className="text-sm text-gray-500">năng lượng</span>
                            </div>
                          </div>
                          {/* Mini progress bar */}
                          <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${style.gradient}`}
                              style={{ width: `${slot.energyPercent}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-gray-500 hover:bg-white hover:text-blue-600"
                                  onClick={() => openEditDialog(slot)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                                Chỉnh sửa
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => openDeleteDialog(slot)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                                Xóa
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
                Thêm bữa ăn mới
              </DialogTitle>
              <DialogDescription>
                Tạo một bữa ăn mới với phần trăm năng lượng tùy chỉnh
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Tên bữa ăn
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Bữa sáng, Bữa phụ chiều..."
                  className="h-11"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Phần trăm năng lượng</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={100}
                      value={Math.round(formData.energyPercent)}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        val = Math.min(100, Math.max(1, val));
                        setFormData({ ...formData, energyPercent: val });
                      }}
                      className="h-8 w-16 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div className="[&_[data-slot=slider-range]]:bg-[#99b94a] [&_[data-slot=slider-thumb]]:border-[#99b94a] [&_[data-slot=slider-thumb]]:bg-[#99b94a]">
                  <Slider
                    value={[Math.round(formData.energyPercent)]}
                    onValueChange={(value) => setFormData({ ...formData, energyPercent: value[0] })}
                    min={1}
                    max={100}
                    step={1}
                    className="py-2"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>1%</span>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700">
                    Còn lại: {(100 - totalEnergyPercent).toFixed(0)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="orderIndex" className="text-sm font-medium">
                    Thứ tự trong ngày
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          orderIndex: Math.max(1, formData.orderIndex - 1),
                        })
                      }
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Input
                      id="orderIndex"
                      type="number"
                      min="1"
                      value={formData.orderIndex}
                      onChange={(e) =>
                        setFormData({ ...formData, orderIndex: Number(e.target.value) })
                      }
                      className="h-8 w-16 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setFormData({ ...formData, orderIndex: formData.orderIndex + 1 })
                      }
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Số nhỏ hơn = bữa ăn sớm hơn trong ngày</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !formData.name.trim()}
                className="gap-2 bg-[#99b94a] hover:bg-[#7a8f3a]"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Tạo bữa ăn
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#99b94a]/10">
                  <Edit className="h-4 w-4 text-[#99b94a]" />
                </div>
                Chỉnh sửa bữa ăn
              </DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho &quot;{selectedSlot?.name}&quot;
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Tên bữa ăn
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Bữa sáng, Bữa phụ..."
                  className="h-11"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Phần trăm năng lượng</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={100}
                      value={Math.round(formData.energyPercent)}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        val = Math.min(100, Math.max(1, val));
                        setFormData({ ...formData, energyPercent: val });
                      }}
                      className="h-8 w-16 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div className="[&_[data-slot=slider-range]]:bg-[#99b94a] [&_[data-slot=slider-thumb]]:border-[#99b94a] [&_[data-slot=slider-thumb]]:bg-[#99b94a]">
                  <Slider
                    value={[Math.round(formData.energyPercent)]}
                    onValueChange={(value) => setFormData({ ...formData, energyPercent: value[0] })}
                    min={1}
                    max={100}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-orderIndex" className="text-sm font-medium">
                    Thứ tự trong ngày
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          orderIndex: Math.max(1, formData.orderIndex - 1),
                        })
                      }
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Input
                      id="edit-orderIndex"
                      type="number"
                      min="1"
                      value={formData.orderIndex}
                      onChange={(e) =>
                        setFormData({ ...formData, orderIndex: Number(e.target.value) })
                      }
                      className="h-8 w-16 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setFormData({ ...formData, orderIndex: formData.orderIndex + 1 })
                      }
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isSubmitting || !formData.name.trim()}
                className="gap-2 bg-[#99b94a] hover:bg-[#7a8f3a]"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-center">Xác nhận xóa bữa ăn</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Bạn có chắc chắn muốn xóa bữa ăn <strong>&quot;{selectedSlot?.name}&quot;</strong>?
                <br />
                <span className="text-amber-600">
                  {selectedSlot && (
                    <>({selectedSlot.energyPercent.toFixed(0)}% năng lượng sẽ được giải phóng)</>
                  )}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                className="gap-2 bg-red-500 hover:bg-red-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Xóa bữa ăn
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
