import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Shell shared by every route.
 *
 * `id="main"` is the skip-link target, and the top padding accounts for the
 * fixed navbar so no page's first element renders underneath it.
 */
export default function RootLayout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="dr-verge-theme">
      <div className="relative flex min-h-svh flex-col bg-background text-foreground">
        <Navbar />
        <div id="main" className="flex-1 pt-14 sm:pt-20">
          <Outlet />
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
