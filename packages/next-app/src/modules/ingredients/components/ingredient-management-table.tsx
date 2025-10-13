'use client';

import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
import { Input } from '@/base/components/ui/input';
import { Select } from '@/base/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/base/components/ui/table';

import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { IngredientDialog } from './ingredient-dialog';

// Types
interface Ingredient {
  id: string;
  name: string;
  category: string;
  createdDate: string;
  status: 'active' | 'inactive';
  description?: string;
  unit?: string;
}

// Mock data for ingredients
const initialIngredients: Ingredient[] = [
  {
    id: 'I00001',
    name: 'Đường',
    category: 'Gia vị',
    createdDate: '04/09/2025',
    status: 'active',
    unit: 'kg',
    description: 'Đường trắng tinh luyện',
  },
  {
    id: 'I00002',
    name: 'Muối',
    category: 'Gia vị',
    createdDate: '04/09/2025',
    status: 'active',
    unit: 'kg',
    description: 'Muối ăn tinh khiết',
  },
  {
    id: 'I00003',
    name: 'Thịt gà',
    category: 'Thịt',
    createdDate: '03/09/2025',
    status: 'active',
    unit: 'kg',
    description: 'Thịt gà tươi',
  },
  {
    id: 'I00004',
    name: 'Cá trê',
    category: 'Cá',
    createdDate: '03/09/2025',
    status: 'active',
    unit: 'con',
    description: 'Cá trê tươi sống',
  },
  {
    id: 'I00005',
    name: 'Tiêu đen',
    category: 'Gia vị',
    createdDate: '02/09/2025',
    status: 'active',
    unit: 'g',
    description: 'Tiêu đen hạt',
  },
  {
    id: 'I00006',
    name: 'Ớt sừng',
    category: 'Rau củ',
    createdDate: '02/09/2025',
    status: 'active',
    unit: 'kg',
    description: 'Ớt sừng tươi',
  },
  {
    id: 'I00007',
    name: 'Chanh hồng',
    category: 'Trái cây',
    createdDate: '01/09/2025',
    status: 'active',
    unit: 'quả',
    description: 'Chanh hồng tươi',
  },
];

const categories = [
  { value: 'all', label: 'Tất cả phân loại' },
  { value: 'gia-vi', label: 'Gia vị' },
  { value: 'thit', label: 'Thịt' },
  { value: 'ca', label: 'Cá' },
  { value: 'rau-cu', label: 'Rau củ' },
  { value: 'trai-cay', label: 'Trái cây' },
  { value: 'sua-trung', label: 'Sữa - Trứng' },
  { value: 'hat-dau', label: 'Hạt - Đậu' },
  { value: 'ngu-coc', label: 'Ngũ cốc' },
];

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'Gia vị': 'bg-orange-100 text-orange-800',
    Thịt: 'bg-red-100 text-red-800',
    Cá: 'bg-blue-100 text-blue-800',
    'Rau củ': 'bg-green-100 text-green-800',
    'Trái cây': 'bg-yellow-100 text-yellow-800',
    'Sữa - Trứng': 'bg-purple-100 text-purple-800',
    'Hạt - Đậu': 'bg-amber-100 text-amber-800',
    'Ngũ cốc': 'bg-indigo-100 text-indigo-800',
  };
  return colorMap[category] || 'bg-gray-100 text-gray-800';
};

interface IngredientManagementTableProps {
  className?: string;
}

export function IngredientManagementTable({ className }: IngredientManagementTableProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>();
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | undefined>();
  const itemsPerPage = 7;

  // Filter ingredients based on search term and category
  const filteredIngredients = ingredients.filter((ingredient: Ingredient) => {
    const matchesSearch =
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      ingredient.category.toLowerCase().includes(selectedCategory.replace('-', ' '));
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIngredients = filteredIngredients.slice(startIndex, startIndex + itemsPerPage);

  const handleEditIngredient = (id: string) => {
    const ingredient = ingredients.find((i) => i.id === id);
    if (ingredient) {
      setEditingIngredient(ingredient);
    }
  };

  const handleDeleteIngredient = (id: string) => {
    const ingredient = ingredients.find((i) => i.id === id);
    if (ingredient) {
      setDeletingIngredient(ingredient);
    }
  };

  const handleAddIngredient = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveIngredient = (ingredientData: any) => {
    if (ingredientData.id) {
      // Edit existing ingredient
      setIngredients((prev) =>
        prev.map((ingredient) =>
          ingredient.id === ingredientData.id
            ? { ...ingredient, ...ingredientData, createdDate: ingredient.createdDate }
            : ingredient,
        ),
      );
      toast.success('Cập nhật nguyên liệu thành công!');
    } else {
      // Add new ingredient
      const newIngredient: Ingredient = {
        ...ingredientData,
        id: `I${String(ingredients.length + 1).padStart(5, '0')}`,
        createdDate: new Date().toLocaleDateString('vi-VN'),
        status: 'active' as const,
      };
      setIngredients((prev) => [newIngredient, ...prev]);
      toast.success('Thêm nguyên liệu mới thành công!');
    }
    setEditingIngredient(undefined);
  };

  const handleConfirmDelete = () => {
    if (deletingIngredient) {
      setIngredients((prev) =>
        prev.filter((ingredient) => ingredient.id !== deletingIngredient.id),
      );
      toast.success(`Đã xóa nguyên liệu "${deletingIngredient.name}" thành công!`);
      setDeletingIngredient(undefined);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with statistics and add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#99b94a]">Quản lý nguyên liệu</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Tổng số: {ingredients.length} nguyên liệu
            {searchTerm && ` • Tìm thấy: ${filteredIngredients.length} kết quả`}
          </p>
        </div>
        <Button
          onClick={handleAddIngredient}
          className="bg-[#99b94a] text-white hover:bg-[#8aa63f]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm nguyên liệu
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex w-1/6 items-center gap-4">
        <div className="relative min-w-[18rem] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo tên nguyên liệu"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <Select
          options={categories}
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value || 'all')}
          placeholder="Phân loại"
          className="w-48"
        />
      </div>

      {/* Ingredients Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Mã</TableHead>
              <TableHead className="font-semibold">Tên nguyên liệu</TableHead>
              <TableHead className="font-semibold">Thuộc nhóm</TableHead>
              <TableHead className="font-semibold">Ngày tạo</TableHead>
              <TableHead className="font-semibold">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedIngredients.length > 0 ? (
              paginatedIngredients.map((ingredient: Ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.id}</TableCell>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getCategoryColor(ingredient.category)}>
                      {ingredient.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{ingredient.createdDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEditIngredient(ingredient.id)}
                          className="cursor-pointer"
                        >
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteIngredient(ingredient.id)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                      <Search className="text-muted-foreground h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {searchTerm || selectedCategory !== 'all'
                          ? 'Không tìm thấy nguyên liệu nào'
                          : 'Chưa có nguyên liệu nào'}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {searchTerm || selectedCategory !== 'all'
                          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                          : 'Bắt đầu bằng cách thêm nguyên liệu đầu tiên'}
                      </p>
                    </div>
                    {!searchTerm && selectedCategory === 'all' && (
                      <Button
                        onClick={handleAddIngredient}
                        className="mt-2 bg-[#99b94a] text-white hover:bg-[#8aa63f]"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm nguyên liệu đầu tiên
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? 'bg-[#99b94a] text-white hover:bg-[#8aa63f]' : ''}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Tiếp theo
          </Button>
        </div>
      )}

      {/* Add Ingredient Dialog */}
      <IngredientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveIngredient}
      />

      {/* Edit Ingredient Dialog */}
      <IngredientDialog
        open={!!editingIngredient}
        onOpenChange={(open) => !open && setEditingIngredient(undefined)}
        ingredient={editingIngredient}
        onSave={handleSaveIngredient}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!deletingIngredient}
        onOpenChange={(open) => !open && setDeletingIngredient(undefined)}
        ingredientName={deletingIngredient?.name || ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
