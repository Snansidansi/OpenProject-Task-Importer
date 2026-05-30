import { PDFParse } from "pdf-parse"

/**
 * @param data file as arraybuffer
 * @throws {Error} if parsing the pdf fails for some reason.
 */
export async function extractTextFromPdf(data: any): Promise<String> {
  try {
    const parser = new PDFParse({ data: data })
    const result = await parser.getText()
    await parser.destroy()

    return result.text
  } catch (error) {
    console.log("Error while extracting text form the pdf: ", error)
    throw error
  }
}
