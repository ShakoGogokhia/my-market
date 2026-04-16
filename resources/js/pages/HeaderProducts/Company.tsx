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
export default function Company() {
  const { t } = useTranslation();
  
  
  
  return (
        <>
  <Header
    showLogin={false}
    showRegister={false}
    showEnergyProduct={false}
    showCart={false}
    showCompany={false}
    showContact={false}
    showVacancy={false}
    showPaymentTerms={false}
    showPromoCode={false}
    showCurrentOrders={false}
    showCompletedOrders={false}
    showReturns={false}
    showWarranty={false}
    showProfile={false}
    showChangePassword={false}
    showBody={true}
    onLoginClick={() => {}}
    onRegisterClick={() => {}}
    onEnergyClick={() => {}}
    onCartClick={() => {}}
    onCompanyClick={() => {}}
    onContactClick={() => {}}
    onVacancyClick={() => {}}
    onPaymentTermsClick={() => {}}
    onPromoCodeClick={() => {}}
    onCurrentOrdersClick={() => {}}
    onCompletedOrdersClick={() => {}}
    onReturnsClick={() => {}}
    onWarrantyClick={() => {}}
    onProfileClick={() => {}}
    onChangePasswordClick={() => {}}
    onShowBodyClick={() => {}}
  />
  
    <div className="max-w-4xl mx-auto p-6 space-y-6 mb-35">
     <Breadcrumb className="mb-10">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">{t('body.energy.backToProducts')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t('nav.company')}</BreadcrumbPage>


        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-green-800">
          {t('body.company.title')}
        </h1>
        <p className="text-gray-700 leading-relaxed">
          {t('body.company.description1')}
          <br /><br />
          {t('body.company.description2')}
          <br /><br />
          {t('body.company.description3')}
        </p>
      </div>
    </div>
      <Footer/>
    </>
  )
}
