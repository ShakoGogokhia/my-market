import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from '@/translation';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
export default function Vacancies() {
  const { t } = useTranslation();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    axios.get('/admin/vacancies')
      .then((response) => setVacancies(response.data))
      .catch((error) => console.error('Error fetching vacancies:', error));
  }, []);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
  
    <div className="max-w-4xl mx-auto p-6 space-y-6 mb-100">
       <Breadcrumb className="mb-10">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">{t('body.energy.backToProducts')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t('body.vacancies.title')}</BreadcrumbPage>

        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

      <h1 className="text-2xl font-bold text-green-800">
        {t('body.vacancies.title')}
      </h1>

      {vacancies.length === 0 ? (
        <p className="text-gray-400 italic">
          {t('body.vacancies.noVacancies')}
        </p>
      ) : (
        vacancies.map((v, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={v.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200 transition-all duration-300">
              <button
                onClick={() => toggleOpen(i)}
                className="flex justify-between items-center w-full text-left"
              >
                <h2 className="text-xl font-semibold text-gray-900">{v.title}</h2>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isOpen && (
                <div className="mt-4 text-gray-700">
                  <p className="mb-4">{v.description}</p>

                  {v.requirements?.length > 0 && (
                    <>
                      <h3 className="font-medium mb-2 text-green-700">
                        {t('body.vacancies.requirementsHeader')}
                      </h3>
                      <ul className="list-disc ml-5 mb-4">
                        {v.requirements.map((r, idx) => (
                          <li key={idx}>
                            <strong>{r.title}:</strong> {r.description}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {v.work_condition && (
                    <>
                      <h3 className="font-medium text-green-700">
                        {t('body.vacancies.workConditionHeader')}
                      </h3>
                      <p>
                        <strong>{v.work_condition.title}</strong>
                      </p>
                      <p>{v.work_condition.description}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
        <Footer/>
        </>
  );
}
