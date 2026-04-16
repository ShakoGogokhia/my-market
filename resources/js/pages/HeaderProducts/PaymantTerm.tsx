import { useTranslation } from '@/translation';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PaymentTerms() {
  const { t } = useTranslation();

  return (
                <>
  <Header 
  />
    <div className="max-w-3xl mx-auto py-10 px-4 text-gray-800 mb-30">
      

<Breadcrumb className="mb-10">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">{t('body.energy.backToProducts')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t('nav.paymantTerm')}</BreadcrumbPage>
          

        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

      <h1 className="text-2xl font-bold mb-6 text-center text-green-700">
        {t('body.paymentTerms.title')}
      </h1>

      <div className="space-y-8 text-lg leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {t('body.paymentTerms.sections.bankTransfer.heading')}
          </h2>
          <p>{t('body.paymentTerms.sections.bankTransfer.text')}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {t('body.paymentTerms.sections.posTerminal.heading')}
          </h2>
          <p>{t('body.paymentTerms.sections.posTerminal.text')}</p>
          <p className="mt-2">
            <strong>{t('body.paymentTerms.sections.posTerminal.addressLabel')}</strong>{' '}
            {t('body.paymentTerms.sections.posTerminal.address')}
          </p>
        </div>
      </div>
    </div>
              <Footer/>
    </>
  );
}
