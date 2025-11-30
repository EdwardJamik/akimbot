import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata = {
  title: "",
}

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </body>
    </html>
  )
}
