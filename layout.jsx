import './global.css';

export const metadata = {
  title: 'ChatBud',
  description: 'ChatGPT-style AI chatbot built with Next.js and Tailwind',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
