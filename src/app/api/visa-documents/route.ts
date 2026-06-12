import { NextRequest, NextResponse } from "next/server";
import { postForm } from "@/lib/vughy-client";

interface VisaDocumentResponseItem {
  id?: string;
  name?: string;
  document_id?: string;
}

interface DocumentNameResponse {
  listdocument?: {
    id?: string;
    name?: string;
  };
}

function parseDocumentIds(value: string | undefined): number[] {
  if (!value) return [];

  return value
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export async function POST(req: NextRequest) {
  try {
    const { visaId, originCountry, destinationCountry } = await req.json();

    if (!visaId || !originCountry || !destinationCountry) {
      return NextResponse.json(
        { error: "visaId, originCountry and destinationCountry are required" },
        { status: 400 }
      );
    }

    const data = await postForm("/getvisadocument", {
      value: String(visaId),
      origin_country: String(originCountry),
      destination_country: String(destinationCountry),
    });

    const groups = (data as { documentid?: VisaDocumentResponseItem[] }).documentid ?? [];

    const documentIdSet = new Set<number>();
    for (const group of groups) {
      for (const id of parseDocumentIds(group.document_id)) {
        documentIdSet.add(id);
      }
    }

    const documentEntries = await Promise.all(
      Array.from(documentIdSet).map(async (id) => {
        try {
          const documentData = await postForm<DocumentNameResponse>(
            "/getlistofdocument",
            { value: String(id) }
          );

          return [
            id,
            {
              id,
              name: documentData.listdocument?.name ?? `Document #${id}`,
            },
          ] as const;
        } catch {
          return [
            id,
            {
              id,
              name: `Document #${id}`,
            },
          ] as const;
        }
      })
    );

    const documentsById = new Map(documentEntries);
    const result = groups.map((group) => {
      const documentIds = parseDocumentIds(group.document_id);

      return {
        id: Number(group.id ?? 0),
        name: group.name ?? "Required documents",
        documentIds,
        documents: documentIds.map((id) => documentsById.get(id) ?? { id, name: `Document #${id}` }),
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch visa documents" },
      { status: 500 }
    );
  }
}
