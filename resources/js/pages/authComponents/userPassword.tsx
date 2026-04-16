import React, { useRef } from 'react';
import { useTranslation } from '@/translation';
import InputError from '@/components/input-error';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Password() {
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const updatePassword: FormEventHandler = (e) => {
    e.preventDefault();

    put(route('password.update'), {
      preserveScroll: true,
      onSuccess: () => reset(),
      onError: (errors) => {
        if (errors.password) {
          reset('password', 'password_confirmation');
          passwordInput.current?.focus();
        }

        if (errors.current_password) {
          reset('current_password');
          currentPasswordInput.current?.focus();
        }
      },
    });
  };

  return (
    <>
      <Header
      />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="space-y-6 bg-white  p-6 rounded-2xl shadow-lg">
          <HeadingSmall
            title={t('body.updatePassword')}
            description={t('body.passwordDescription')}
          />

          <form onSubmit={updatePassword} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="current_password" className="text-green-700">
                {t('body.currentPassword')}
              </Label>

              <Input
                id="current_password"
                ref={currentPasswordInput}
                value={data.current_password}
                onChange={(e) => setData('current_password', e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder={t('body.currentPassword')}
                className="bg-green-50 border border-green-200  focus:ring-green-700"
              />
              <InputError message={errors.current_password} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-green-700 ">
                {t('body.newPassword')}
              </Label>

              <Input
                id="password"
                ref={passwordInput}
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder={t('body.newPassword')}
                className="bg-green-50 border border-green-200  focus:ring-green-700"
              />
              <InputError message={errors.password} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password_confirmation" className="text-green-700 ">
                {t('body.confirmPassword')}
              </Label>

              <Input
                id="password_confirmation"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder={t('body.confirmPassword')}
                className="bg-green-50  border border-green-200  focus:ring-green-700"
              />
              <InputError message={errors.password_confirmation} />
            </div>

            <Button
              type="submit"
              disabled={processing}
              className="w-full bg-green-700 text-white hover:bg-green-800"
            >
              {t('body.updatePassword')}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
