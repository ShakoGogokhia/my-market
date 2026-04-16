// PublicLayout.tsx
import React, { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PublicLayoutProps {
  children: ReactNode;


  showLogin: boolean;
  showRegister: boolean;
  showEnergyProduct: boolean;
  showCart: boolean;
  showCompany: boolean;
  showContact: boolean;
  showVacancy: boolean;
  showPaymentTerms: boolean;
  showPromoCode: boolean;
  showCurrentOrders: boolean;
  showCompletedOrders: boolean;
  showReturns: boolean;
  showWarranty: boolean;
  showProfile: boolean;
  showChangePassword: boolean;
  showBody: boolean;

  // handlers
  onLoginClick:     (e: React.MouseEvent) => void;
  onRegisterClick:  (e: React.MouseEvent) => void;
  onEnergyClick:    (e: React.MouseEvent) => void;
  onCartClick:      (e: React.MouseEvent) => void;
  onCompanyClick:   (e: React.MouseEvent) => void;
  onContactClick:   (e: React.MouseEvent) => void;
  onVacancyClick:   (e: React.MouseEvent) => void;
  onPaymentTermsClick:(e: React.MouseEvent) => void;
  onPromoCodeClick: (e: React.MouseEvent) => void;
  onCurrentOrdersClick:   () => void;
  onCompletedOrdersClick: () => void;
  onReturnsClick:         () => void;
  onWarrantyClick:        () => void;
  onProfileClick:         () => void;
  onChangePasswordClick:  () => void;
  onShowBodyClick:        () => void;
}

export default function MainLayout({
  children,

  showLogin,
  showRegister,
  showEnergyProduct,
  showCart,
  showCompany,
  showContact,
  showVacancy,
  showPaymentTerms,
  showPromoCode,
  showCurrentOrders,
  showCompletedOrders,
  showReturns,
  showWarranty,
  showProfile,
  showChangePassword,
  showBody,

  onLoginClick,
  onRegisterClick,
  onEnergyClick,
  onCartClick,
  onCompanyClick,
  onContactClick,
  onVacancyClick,
  onPaymentTermsClick,
  onPromoCodeClick,
  onCurrentOrdersClick,
  onCompletedOrdersClick,
  onReturnsClick,
  onWarrantyClick,
  onProfileClick,
  onChangePasswordClick,
  onShowBodyClick,
}: PublicLayoutProps) {
  return (
    <>
      <Header
        showLogin={showLogin}
        showRegister={showRegister}
        showEnergyProduct={showEnergyProduct}
        showCart={showCart}
        showCompany={showCompany}
        showContact={showContact}
        showVacancy={showVacancy}
        showPaymentTerms={showPaymentTerms}
        showPromoCode={showPromoCode}
        showCurrentOrders={showCurrentOrders}
        showCompletedOrders={showCompletedOrders}
        showReturns={showReturns}
        showWarranty={showWarranty}
        showProfile={showProfile}
        showChangePassword={showChangePassword}
        showBody={showBody}

        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        onEnergyClick={onEnergyClick}
        onCartClick={onCartClick}
        onCompanyClick={onCompanyClick}
        onContactClick={onContactClick}
        onVacancyClick={onVacancyClick}
        onPaymentTermsClick={onPaymentTermsClick}
        onPromoCodeClick={onPromoCodeClick}
        onCurrentOrdersClick={onCurrentOrdersClick}
        onCompletedOrdersClick={onCompletedOrdersClick}
        onReturnsClick={onReturnsClick}
        onWarrantyClick={onWarrantyClick}
        onProfileClick={onProfileClick}
        onChangePasswordClick={onChangePasswordClick}
        onShowBodyClick={onShowBodyClick}
      />

      <main className="min-h-screen">{children}</main>

      <Footer />
    </>
  );
}
