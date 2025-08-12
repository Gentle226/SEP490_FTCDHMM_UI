import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/base/components/ui/button';
import { userSchema } from '@/modules/users';

import { UserActions } from './user-actions';

export async function Header() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const user = userSchema
    .pick({
      id: true,
      fullName: true,
      role: true,
      gender: true,
    })
    .safeParse(JSON.parse(cookieStore.get('user')?.value ?? '{}')).data;

  return (
    <header className="z-50 border-b bg-white [&_*]:text-base!">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Image src="/travel-booking-logo.png" alt="Logo" height={20} width={166} />
          </Link>
          <Link href="/hotels">
            <Button variant="link" className="relative">
              Khách sạn
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <UserActions user={user} />
          <Button variant="ghost" size="icon" className="text-gray-500">
            <ShoppingCart />
          </Button>
        </div>
      </div>
    </header>
  );
}
