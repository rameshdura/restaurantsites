import { GET as getLlms } from "../llms.txt/route"

export async function GET() {
  return getLlms()
}
