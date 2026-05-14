import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        stream.end(buffer);
    });
}

export async function POST(request) {
    try {
        // Log to confirm env vars are loaded
        console.log('[upload-video] Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('[upload-video] API key present:', !!process.env.CLOUDINARY_API_KEY);
        console.log('[upload-video] API secret present:', !!process.env.CLOUDINARY_API_SECRET);

        const formData = await request.formData();
        const videoFile = formData.get('video');
        const mockId = formData.get('mockId') ?? 'unknown';
        const questionIndex = formData.get('questionIndex') ?? '0';

        console.log('[upload-video] File received:', videoFile?.name, 'Size:', videoFile?.size);

        if (!videoFile || typeof videoFile === 'string') {
            return NextResponse.json(
                { error: 'No video file received.' },
                { status: 400 }
            );
        }

        const arrayBuffer = await videoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const publicId = `genview/interviews/${mockId}/question_${Number(questionIndex) + 1}_${Date.now()}`;

        const result = await uploadToCloudinary(buffer, {
            resource_type: 'video',
            public_id: publicId,
            overwrite: false,
        });

        console.log('[upload-video] Upload success:', result.secure_url);

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
        });

    } catch (error) {
        // This will now print the REAL error in your terminal
        console.error('[upload-video] FULL ERROR:', error);
        return NextResponse.json(
            { error: 'Video upload failed.', detail: error.message },
            { status: 500 }
        );
    }
}