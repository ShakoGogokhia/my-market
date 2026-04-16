import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from '@/translation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WarrantyInfo() {
  const [code, setCode] = useState("");
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/products/code/${code}`);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setProduct(null);
      setError(t('body.warranty.notFound'));
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto py-10 px-4 text-gray-800 mb-30">

        <Breadcrumb className="mb-10">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t('body.energy.backToProducts')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('nav.warrantyTerm')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-bold mb-6 text-center text-green-700">
          {t('body.warranty.searchTitle')}
        </h1>

        <div className="mb-6">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('body.warranty.placeholder')}
            className="p-2 border rounded w-full sm:w-80 "
          />
          <button
            onClick={handleSearch}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-5"
          >
            {t('body.warranty.search')}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {product && (
          <div className="mt-8 p-4 border rounded-xl bg-gray-100  text-gray-800 ">
            <h3 className="font-bold text-lg text-green-700  mb-2">
              {t('body.warranty.foundProduct')}
            </h3>
            <p><strong>{t('body.warranty.code')}:</strong> {product.code}</p>
            <p><strong>{t('body.warranty.name')}:</strong> {product.name}</p>
            <p><strong>{t('body.warranty.brand')}:</strong> {product.brand}</p>
            <p><strong>{t('body.warranty.price')}:</strong> ₾{product.price}</p>
            <p><strong>{t('body.warranty.guarantee')}:</strong> {product.warranty || t('body.warranty.noInfo')}</p>
          </div>
        )}

        <div className="space-y-4 text-gray-700  leading-relaxed text-base mt-8">
          <h2 className="text-xl font-bold text-green-700 mb-4">
            {t('body.warranty.conditionsTitle')}
          </h2>
          <p>{t('body.warranty.condition1')}</p>
          <p>{t('body.warranty.condition2')}</p>
          <p>{t('body.warranty.condition3')}</p>

          <h3 className="font-semibold mt-6 text-green-600 ">
            {t('body.warranty.excludesTitle')}
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('body.warranty.exclude1')}</li>
            <li>{t('body.warranty.exclude2')}</li>
            <li>{t('body.warranty.exclude3')}</li>
            <li>{t('body.warranty.exclude4')}</li>
            <li>{t('body.warranty.exclude5')}</li>
            <li>{t('body.warranty.exclude6')}</li>
            <li>{t('body.warranty.exclude7')}</li>
            <li>{t('body.warranty.exclude8')}</li>
            <li>{t('body.warranty.exclude9')}</li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
}

