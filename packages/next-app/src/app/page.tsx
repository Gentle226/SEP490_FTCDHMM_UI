'use client';

import { ChevronRightIcon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Header } from '@/base/components/layout/header';
import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { RecipeCard } from '@/base/components/ui/recipe-card';
import { useAuth } from '@/modules/auth';

export default function HomePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for categories (sẽ thay bằng API sau)
  const categories = [
    { name: 'thịt', image: '/placeholder-meat.jpg' },
    { name: 'thực đơn món ngon mỗi ngày', image: '/placeholder-daily.jpg' },
    { name: 'trứng', image: '/placeholder-egg.jpg' },
    { name: 'cá', image: '/placeholder-fish.jpg' },
    { name: 'bánh', image: '/placeholder-bread.jpg' },
    { name: 'tàu hũ', image: '/placeholder-tofu.jpg' },
    { name: 'gỏi gà', image: '/placeholder-salad.jpg' },
    { name: 'gà', image: '/placeholder-chicken.jpg' },
  ];

  // Mock data for recent recipes (sẽ thay bằng API sau)
  const recentRecipes = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Công thức món ăn ${i + 1}`,
    author: `Tác giả ${i + 1}`,
    image: undefined,
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  // Common search and recipes section
  const mainContent = (
    <main className="min-h-screen bg-gray-50">
      {/* Search Section */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6">
              <img
                src="/Fitfood Tracker Logo.png"
                alt="FitFood Tracker"
                className="mx-auto mb-4 h-36 w-auto"
              />
            </div>

            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Tìm tên món hay nguyên liệu"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-2 border-gray-200 pr-12 text-lg focus:border-[#99b94a]"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-1 right-1 h-10 w-10 bg-[#99b94a] hover:bg-[#7a8f3a]"
              >
                <SearchIcon className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Từ Khóa Thịnh Hành</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-200"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="px-2 text-center text-sm font-medium text-white">
                    {category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Recipes Section - Only show for logged in users */}
        {user && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Món bạn mới xem gần đây</h2>
              <Button variant="ghost" className="text-[#99b94a] hover:text-[#7a8f3a]">
                <span>Cập nhật 4:36</span>
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {recentRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  author={recipe.author}
                  image={recipe.image}
                  isLoading={true} // Set to true to show skeleton
                />
              ))}
            </div>
          </section>
        )}

        {/* All Recipes Section */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Tất Cả Công Thức</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 20 }, (_, i) => (
              <RecipeCard
                key={i}
                title={`Món ăn ${i + 1}`}
                author={`Tác giả ${i + 1}`}
                isLoading={true} // Set to true to show skeleton
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );

  // If user is logged in, show with dashboard layout (sidebar)
  if (user) {
    return (
      <DashboardLayout>
        <div className="-m-4">
          {' '}
          {/* Remove default padding from DashboardLayout */}
          {mainContent}
        </div>
      </DashboardLayout>
    );
  }

  // If user is not logged in, show with regular header
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {mainContent}
    </div>
  );
}
