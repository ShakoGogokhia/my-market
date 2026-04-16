import React from 'react';
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

const Contact = () => {
  const { t } = useTranslation();

  return (
            <>
  <Header 
  />
  
    <div className="font-sans bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto py-10 px-4">
      <Breadcrumb className="mb-10">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">{t('body.energy.backToProducts')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t('nav.contact')}</BreadcrumbPage>
          

        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

        <div className="grid md:grid-cols-0 gap-8">
          <div className="">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11901.059973647289!2d44.7396749052766!3d41.758765635066485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440d7aa991f571%3A0x71e663f86c18be18!2s44%20Baron%20De%20Bai%20St%2C%20T'bilisi%2C%20Georgia!5e0!3m2!1sen!2sge!4v1713179260629!5m2!1sen!2sge"
              width="100%"
              height="500"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('contact.title', 'Google Map')}
              className="w-full"
            ></iframe>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-14 text-sm text-gray-700">
          <div>
            <div>📍</div>
            <p>{t('body.contact.address')}</p>
          </div>
          <div>
            <div>📞</div>
            <p>{t('body.contact.phone')}</p>
          </div>
          <div>
            <div>📧</div>
            <p>{t('body.contact.email')}</p>
          </div>
          <div>
            <div>⏰</div>
            <p>{t('body.contact.hours')}</p>
          </div>
        </div>
      </div>
    </div>
          <Footer/>
    </>
  )
};

export default Contact;
