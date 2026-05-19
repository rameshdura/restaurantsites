"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { validateRestaurantData } from "@/lib/validator"
import { Check, AlertCircle } from "lucide-react"

export default function JsonValidatorPage() {
  const [jsonInput, setJsonInput] = useState("")
  const [result, setResult] = useState<{ isValid: boolean; errors: string[] } | null>(null)

  const handleValidate = () => {
    try {
      const data = JSON.parse(jsonInput)
      const validation = validateRestaurantData(data)
      setResult(validation)
    } catch {
      setResult({ isValid: false, errors: ["Invalid JSON format"] })
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>External JSON Validator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Paste your JSON here..."
            className="min-h-[300px] font-mono text-xs"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <Button className="w-full" onClick={handleValidate}>Validate JSON</Button>
          
          {result && (
            <div className={`p-4 rounded-lg flex gap-3 ${result.isValid ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              {result.isValid ? <Check /> : <AlertCircle />}
              <div>
                <p className="font-bold">{result.isValid ? "Valid JSON" : "Invalid JSON"}</p>
                <ul className="list-disc pl-5 text-sm">
                  {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
