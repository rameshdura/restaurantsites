import { redirect } from "next/navigation"

interface OwnerPageProps {
  params: Promise<{ restaurant: string }>
}

export default async function OwnerPage({ params }: OwnerPageProps) {
  const { restaurant: slug } = await params

  redirect(`/${slug}/owner/scan`)
}
