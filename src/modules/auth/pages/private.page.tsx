'use client';

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { Button } from '@/base/components/ui/button';
import { userService } from '@/modules/users';

export function PrivatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: res } = useSuspenseQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => userService.getUserProfile(),
  });

  const handleLogout = async () => {
    await axios.delete('/api/auth/delete-cookie');
    queryClient.removeQueries({ queryKey: ['users', 'profile'] });
    router.push('/auth/login');
  };

  return (
    <>
      <p>Hello, UID {res.data.id}</p>
      <Button variant="danger" onClick={handleLogout}>
        Logout
      </Button>
    </>
  );
}
