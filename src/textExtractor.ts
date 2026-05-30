import { extractText, getDocumentProxy } from "unpdf"

/**
 * @param data file as arraybuffer
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
    const result = await extractText(pdf)

    return result.text.join(" ")
  } catch (error) {
    console.error("Error while extracting text from the pdf: ", error)
    throw error
  }
}
