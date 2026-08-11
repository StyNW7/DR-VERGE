import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "@/layouts/root-layout";
import ScrollToTop from "@/utility/ScrollToTop";
import ScrollToTopFunction from "@/utility/ScrollToTopFunction";
import { LoadingState } from "@/components/common/Primitives";

import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/Utility/NotFound404";

// The demo and research pages are code-split: the home page is the entry point
// for most visitors and should not pay for recharts or the demo's upload logic.
const DemoPage = lazy(() => import("@/pages/DemoPage"));
const ResearchPage = lazy(() => import("@/pages/ResearchPage"));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route
            path="demo"
            element={
              <Suspense fallback={<LoadingState label="Loading model demo" />}>
                <DemoPage />
              </Suspense>
            }
          />
          <Route
            path="research"
            element={
              <Suspense fallback={<LoadingState label="Loading research" />}>
                <ResearchPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopFunction />
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
