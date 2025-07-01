import "./globals.css";
import { Toaster } from "react-hot-toast";
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.4.0/fonts/remixicon.css" />
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-brands/css/uicons-brands.css" />
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-bold-rounded/css/uicons-bold-rounded.css" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1856de",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
};
export default RootLayout;
