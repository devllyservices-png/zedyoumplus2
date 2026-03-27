import { redirect } from "next/navigation"

type Props = { params: Promise<{ id: string }> }

/** Legacy URL: public seller page now lives at `/sellers/[id]/store`. */
export default async function SellerProfileRedirect({ params }: Props) {
  const { id } = await params
  redirect(`/sellers/${id}/store`)
}
