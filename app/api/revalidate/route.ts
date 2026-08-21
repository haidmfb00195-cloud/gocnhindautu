import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    
    // Kiểm tra token bảo mật (trong thực tế nên dùng biến môi trường)
    if (token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { path, tag } = body;

    if (path) {
      revalidatePath(path);
    }
    
    if (tag) {
      revalidateTag(tag);
    }

    return NextResponse.json({ revalidated: true, now: Date.now(), path, tag });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
