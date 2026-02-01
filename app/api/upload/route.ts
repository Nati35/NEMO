import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Generate a unique file name
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `upload-${timestamp}.${fileExt}`;

        // Convert File to Buffer for server-side upload if needed, 
        // but supabase-js can handle File/Blob in some envs. 
        // In Node (Next.js API), we might need an ArrayBuffer.
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
            .from('media')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('media')
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrlData.publicUrl });

    } catch (err: any) {
        console.error('Upload API error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
