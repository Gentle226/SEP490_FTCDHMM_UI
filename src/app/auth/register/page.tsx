import { Suspense } from 'react';

import { RegisterPage } from '@/modules/auth';

function RegisterPageContent() {
  return <RegisterPage />;
}

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
