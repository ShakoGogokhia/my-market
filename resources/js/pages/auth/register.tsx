import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslation } from '@/translation';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    registration_type: 'personal' | 'organization';
    mobile_number: string;
    organization_identification_code?: string;
    contact_person?: string;
    address?: string;
    organization_location?: string;
};


export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        registration_type: 'personal',
        mobile_number: '',
        organization_identification_code: '',
        contact_person: '',
        address: '',
        organization_location: '',
    });
    

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
           <>
  <Header 
  />
        <AuthLayout title={t('nav.register')} description="">
           <Head title={t('nav.register')} />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">

                    <div className="grid gap-2">
                    <Label>{t('body.registerForm.type')}</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="personal"
                                    checked={data.registration_type === 'personal'}
                                    onChange={() => setData('registration_type', 'personal')}
                                    disabled={processing}
                                />
                               {t('body.registerForm.personal')}
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="organization"
                                    checked={data.registration_type === 'organization'}
                                    onChange={() => setData('registration_type', 'organization')}
                                    disabled={processing}
                                />
                               {t('body.registerForm.organization')}
                            </label>
                        </div>
                        <InputError message={errors.registration_type} />
                    </div>

                    <div className="grid gap-2">
                    <Label htmlFor="name">{t('body.profile.name')}</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder=""
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                    <Label htmlFor="mobile_number">{t('body.registerForm.mobile')}</Label>
                        <Input
                            id="mobile_number"
                            type="text"
                            required
                            tabIndex={2}
                            value={data.mobile_number}
                            onChange={(e) => setData('mobile_number', e.target.value)}
                            disabled={processing}
                            placeholder=""
                        />
                        <InputError message={errors.mobile_number} />
                    </div>

                    {data.registration_type === 'organization' && (
                        <>
                            <div className="grid gap-2">
                            <Label htmlFor="organization_identification_code">{t('body.registerForm.code')}</Label>
                                <Input
                                    id="organization_identification_code"
                                    type="text"
                                    tabIndex={3}
                                    value={data.organization_identification_code || ''}
                                    onChange={(e) => setData('organization_identification_code', e.target.value)}
                                    disabled={processing}
                                    placeholder=""
                                />
                                <InputError message={errors.organization_identification_code} />
                            </div>

                            <div className="grid gap-2">
                            <Label htmlFor="contact_person">{t('body.registerForm.contact')}</Label>
                                <Input
                                    id="contact_person"
                                    type="text"
                                    tabIndex={4}
                                    value={data.contact_person || ''}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                    disabled={processing}
                                    placeholder=""
                                />
                                <InputError message={errors.contact_person} />
                            </div>

                            <div className="grid gap-2">
                            <Label htmlFor="organization_location">{t('body.registerForm.orgLocation')}</Label>
                                <Input
                                    id="organization_location"
                                    type="text"
                                    tabIndex={5}
                                    value={data.organization_location || ''}
                                    onChange={(e) => setData('organization_location', e.target.value)}
                                    disabled={processing}
                                    placeholder=""
                                />
                                <InputError message={errors.organization_location} />
                            </div>
                        </>
                    )}

                            {data.registration_type === 'personal' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="location">{t('body.registerForm.address')}</Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        tabIndex={5}
                                        value={data.address || ''}
                                        onChange={(e) => setData('address', e.target.value)}
                                        disabled={processing}
                                        placeholder=""
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            )}

                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('body.profile.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={data.registration_type === 'organization' ? 5 : 3}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder=""
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t("body.loginForm.passwordLabel")}</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={data.registration_type === 'organization' ? 6 : 4}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder=""
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('body.confirmPassword')}</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={data.registration_type === 'organization' ? 7 : 5}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder=""
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full bg-gray-700" tabIndex={8} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('nav.register')}
                    </Button>
                </div>
            </form>
        </AuthLayout>
          <Footer/>
    </>
    );
}
