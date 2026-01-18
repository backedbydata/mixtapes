import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY");

interface OcrLine {
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

interface OcrResult {
  rawText: string;
  lines: OcrLine[];
  confidence: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Google Vision API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { image } = body;

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: image },
              features: [
                { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const error = await visionResponse.text();
      throw new Error(`Vision API error: ${error}`);
    }

    const visionData = await visionResponse.json();
    const annotation = visionData.responses?.[0]?.fullTextAnnotation;

    if (!annotation) {
      return new Response(
        JSON.stringify({
          rawText: "",
          lines: [],
          confidence: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const pages = annotation.pages || [];
    const lines: OcrLine[] = [];
    let totalConfidence = 0;
    let lineCount = 0;

    interface WordData {
      text: string;
      confidence: number;
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
      centerY: number;
    }

    for (const page of pages) {
      for (const block of page.blocks || []) {
        for (const paragraph of block.paragraphs || []) {
          const wordsData: WordData[] = [];

          for (const word of paragraph.words || []) {
            const wordText = word.symbols?.map((s: { text: string }) => s.text).join("") || "";
            const vertices = word.boundingBox?.vertices || [];

            let minX = Infinity;
            let minY = Infinity;
            let maxX = 0;
            let maxY = 0;

            for (const v of vertices) {
              if (v.x !== undefined) {
                minX = Math.min(minX, v.x);
                maxX = Math.max(maxX, v.x);
              }
              if (v.y !== undefined) {
                minY = Math.min(minY, v.y);
                maxY = Math.max(maxY, v.y);
              }
            }

            const centerY = (minY + maxY) / 2;
            wordsData.push({
              text: wordText,
              confidence: word.confidence || 0.5,
              minX: minX === Infinity ? 0 : minX,
              minY: minY === Infinity ? 0 : minY,
              maxX,
              maxY,
              centerY,
            });
          }

          if (wordsData.length === 0) continue;

          const avgWordHeight = wordsData.reduce((sum, w) => sum + (w.maxY - w.minY), 0) / wordsData.length;
          const lineThreshold = avgWordHeight * 0.6;

          wordsData.sort((a, b) => a.centerY - b.centerY);

          const visualLines: WordData[][] = [];
          let currentLine: WordData[] = [wordsData[0]];

          for (let i = 1; i < wordsData.length; i++) {
            const prevWord = wordsData[i - 1];
            const currWord = wordsData[i];

            if (Math.abs(currWord.centerY - prevWord.centerY) > lineThreshold) {
              visualLines.push(currentLine);
              currentLine = [currWord];
            } else {
              currentLine.push(currWord);
            }
          }
          visualLines.push(currentLine);

          for (const lineWords of visualLines) {
            lineWords.sort((a, b) => a.minX - b.minX);

            const lineText = lineWords.map(w => w.text).join(" ");
            const lineConfidence = lineWords.reduce((sum, w) => sum + w.confidence, 0) / lineWords.length;
            const minX = Math.min(...lineWords.map(w => w.minX));
            const minY = Math.min(...lineWords.map(w => w.minY));
            const maxX = Math.max(...lineWords.map(w => w.maxX));
            const maxY = Math.max(...lineWords.map(w => w.maxY));

            if (lineText.trim()) {
              lines.push({
                text: lineText.trim(),
                boundingBox: {
                  x: minX,
                  y: minY,
                  width: maxX - minX || 100,
                  height: maxY - minY || 20,
                },
                confidence: lineConfidence,
              });
              totalConfidence += lineConfidence;
              lineCount++;
            }
          }
        }
      }
    }

    const result: OcrResult = {
      rawText: annotation.text || "",
      lines,
      confidence: lineCount > 0 ? totalConfidence / lineCount : 0,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "OCR processing failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});