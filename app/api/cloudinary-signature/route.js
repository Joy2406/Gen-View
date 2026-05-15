/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary
 *
 * Generates a signed upload signature so the browser can upload
 * directly to Cloudinary without routing the video through Vercel.
 * This is a tiny request (<1KB) so it has no size limit issues.
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
        const { publicId } = await request.json();

        const timestamp = Math.round(Date.now() / 1000);

        const signature = cloudinary.utils.api_sign_request(
            { timestamp, public_id: publicId },
            process.env.CLOUDINARY_API_SECRET
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            publicId,
        });
    } catch (error) {
        console.error('[cloudinary-signature] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate signature.', detail: error.message },
            { status: 500 }
        );
    }
}