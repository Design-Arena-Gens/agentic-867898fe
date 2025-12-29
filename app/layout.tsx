export const metadata = {
  title: 'Excel Agent - انتقال داده اکسل',
  description: 'ایجنت خودکار برای انتقال داده از یک فایل اکسل به فایل دیگر',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
