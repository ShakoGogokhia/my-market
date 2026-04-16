import "../css/app.css";

import axios from "axios";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { initializeTheme } from "./hooks/use-appearance";
import { TranslationProvider } from "@/translation";
import MainLayout from "@/layouts/MainLayout";
import { CookiesProvider } from "react-cookie";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";


const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

if (token) {
  axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
} else {
  console.error("CSRF token not found in meta tag");
}


axios.defaults.withCredentials = true;

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob("./pages/**/*.tsx")
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <CookiesProvider>
        <TranslationProvider>
          <App {...props} />
        </TranslationProvider>
      </CookiesProvider>
    );
  },
  progress: {
    color: "#4B5563",
  },
});

initializeTheme();
