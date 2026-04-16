import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useTranslation } from '@/translation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ProfileForm = {
  name: string;
  email: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
  const { auth } = usePage<SharedData>().props;
  const { t } = useTranslation();

  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
    name: auth.user.name,
    email: auth.user.email,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    patch(route('profile.update'), {
      preserveScroll: true,
      preserveState: true,
    });
  };

  return (
    <>
      <Header
      />
      <div className="flex justify-center items-start min-h-[80vh] px-4 mt-20">
        <div className="w-full max-w-lg space-y-8 bg-white p-6 rounded-2xl shadow-lg">
          <HeadingSmall
            title={t('body.profile.title')}
            description={t('body.profile.description')}
          />

          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-green-700 ">
                {t('body.profile.name')}
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
                autoComplete="name"
                placeholder={t('body.profile.name')}
                className="bg-green-50  border border-green-200  focus:ring-green-700"
              />
              <InputError className="mt-1" message={errors.name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-green-700 ">
                {t('body.profile.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
                autoComplete="username"
                placeholder={t('body.profile.email')}
                className="bg-green-50  border border-green-200 focus:ring-green-700"
              />
              <InputError className="mt-1" message={errors.email} />
            </div>

            {mustVerifyEmail && auth.user.email_verified_at === null && (
              <div className="text-sm text-yellow-600 ">
                <p className="-mt-3">
                  {t('body.profile.email_unverified')}&nbsp;
                  <Link
                    href={route('verification.send')}
                    method="post"
                    as="button"
                    className="underline underline-offset-4 hover:text-green-700 transition"
                  >
                    {t('body.profile.resend_verification')}
                  </Link>
                </p>
                {status === 'verification-link-sent' && (
                  <p className="mt-1 text-green-600 font-medium">
                    {t('body.profile.saved')}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                disabled={processing}
                className="bg-green-700 hover:bg-green-800 text-white"
              >
                {t('body.profile.save')}
              </Button>
              <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out"
                enterFrom="opacity-0"
                leave="transition ease-in-out"
                leaveTo="opacity-0"
              >
                <p className="text-sm text-green-600 ">
                  {t('body.profile.saved')}
                </p>
              </Transition>
            </div>
          </form>

          <hr className="my-6 border-green-200 " />

          <DeleteUser />
        </div>
      </div>
      <Footer />
    </>
  );
}
