/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary
 */

import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        const body = await request.json();
        const { publicId } = body;

        if (!publicId || typeof publicId !== 'string') {
            return NextResponse.json(
                { error: 'publicId is required and must be a string.' },
                { status: 400 }
            );
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video',
        });

        if (result.result === 'ok' || result.result === 'not found') {
            return NextResponse.json({ success: true, result: result.result });
        }

        return NextResponse.json(
            { error: 'Cloudinary deletion did not confirm success.', result },
            { status: 500 }
        );

    } catch (error) {
        console.error('[delete-video] Error:', error);
        return NextResponse.json(
            { error: 'Video deletion failed.', detail: error.message },
            { status: 500 }
        );
    }
}