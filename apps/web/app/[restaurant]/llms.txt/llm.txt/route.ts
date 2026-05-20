import { GET as getLlms } from "../route"

interface RouteProps {
  params: Promise<{ restaurant: string }>
}

export async function GET(request: Request, { params }: RouteProps) {
  return getLlms(request, { params })
}
