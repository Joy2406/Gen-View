/**
 * @project GenView AI Interview Platform
 * @copyright 2026 Joy Pasala - All Rights Reserved
 * @license Proprietary 
 */

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { interviewId, userEmail } = await req.json();

        // 1. Check for API Key immediately
        if (!process.env.RESEND_API_KEY) {
            console.error("❌ MISSING API KEY: Check your .env.local file");
            return NextResponse.json({ error: "API Key not configured on server" }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const logoUrl = "https://gen-view-one.vercel.app/logo_gv.png"; 
        const operatorUrl = `https://gen-view-one.vercel.app/operator/${interviewId}`;

        // 2. Send the email
        const response = await resend.emails.send({
            from: 'GenView AI <onboarding@resend.dev>',
            to: ['joypasala2406@gmail.com'], 
            subject: '🚨 Action Required: New Interview Evaluation',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-bottom: 1px solid #eee;">
                        <img src="${logoUrl}" alt="GenView Logo" width="100" style="margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" />
                        <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Operator Review Required</h1>
                    </div>
                    <div style="padding: 40px; background-color: #ffffff;">
                        <p style="font-size: 16px; color: #34495e; line-height: 1.6;">Hello Joy,</p>
                        <p style="font-size: 16px; color: #34495e; line-height: 1.6;">
                            A new interview session has been completed by <strong>${userEmail}</strong>. 
                        </p>
                        <div style="background-color: #ebf5fb; border-left: 4px solid #3498db; padding: 15px; margin: 25px 0;">
                            <p style="margin: 0; color: #2980b9; font-weight: 600; font-style: italic;">
                                "There is a user who has given an interview and it needs to be evaluated."
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="${operatorUrl}" 
                               style="background-color: #3498db; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; display: inline-block;">
                               Open Operator Window
                            </a>
                        </div>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                        <p style="font-size: 12px; color: #95a5a6; margin: 0;">&copy; 2026 GenView AI Platform.</p>
                    </div>
                </div>
            `
        });

        // 3. CRITICAL FIX: Resend returns errors inside the response object
        if (response.error) {
            console.error("❌ RESEND API ERROR:", response.error);
            return NextResponse.json({ error: response.error.message }, { status: 401 });
        }

        console.log("✅ Email sent successfully:", response.data.id);
        return NextResponse.json({ success: true, id: response.data.id });

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}