import Header from "@/components/Header";
import "./globals.css";
import './globalicon.css';
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import { RouteGuardProvider } from "@/contexts/RouteGuardContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata = {
  title: "Velthar SCP - Secure, Contain, Protect",
  description: "Wiki fan de SCP del servidor de roleplay Velthar. Explora anomalías, historias y el universo de la Fundación SCP.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ErrorBoundary>
      <UserAuthProvider>
        <RouteGuardProvider>
          <body
            className={`antialiased flex flex-col min-h-screen`}
          >
            <ToastProvider>
              <Header />
              {children}
            </ToastProvider>
          </body>
        </RouteGuardProvider>
      </UserAuthProvider>
      </ErrorBoundary>
    </html>
  );
}
