import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topic: string; filename: string }> }
) {
  const { topic, filename } = await params;
  const decodedTopic = decodeURIComponent(topic);
  const decodedFilename = decodeURIComponent(filename);

  // Strict sanitization: enforce alphanumeric topic and prevent traversal
  const safeTopic = path.basename(decodedTopic);
  const safeFilename = path.basename(decodedFilename);

  if (!/^[a-z0-9_-]+$/i.test(safeTopic) || !safeFilename || safeFilename.startsWith('.')) {
    return new NextResponse('Invalid request parameters', { status: 400 });
  }

  const resourcesDir = path.resolve(process.cwd(), 'resources');
  const filePath = path.resolve(resourcesDir, safeTopic, safeFilename);

  // Path boundary check: ensure target is strictly inside the resources directory
  if (!filePath.startsWith(resourcesDir + path.sep)) {
    return new NextResponse('Access denied', { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(safeFilename).toLowerCase();

  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.ipynb': 'application/x-ipynb+json',
    '.md': 'text/markdown; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.py': 'text/x-python; charset=utf-8',
    '.tex': 'text/x-tex; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.zip': 'application/zip',
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${safeFilename}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
