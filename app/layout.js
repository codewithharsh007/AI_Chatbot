import ThemeProvider from "./context/ThemeContext";
import AuthProvider from "../components/AuthProvider";
import AuthChecker from "../components/AuthChecker"; // Add this
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "VaaniAI - Your Intelligent AI Assistant",
  description:
    "Experience intelligent conversations with VaaniAI - powered by multiple AI models",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <AuthChecker /> {/* Add this component */}
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#333",
                  color: "#fff",
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
