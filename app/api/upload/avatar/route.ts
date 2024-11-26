import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

/**
 * @swagger
 * /api/upload-avatar:
 *   post:
 *     tags:
 *       - User Profile
 *     summary: Upload a new avatar image for the authenticated user.
 *     description: Allows the authenticated user to upload an avatar image. The image is stored in Supabase storage and a public URL is returned.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image file to be uploaded.
 *                 example: (binary file)
 *     responses:
 *       200:
 *         description: Successfully uploaded the avatar and returned the public URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The public URL of the uploaded avatar image.
 *                   example: "https://your-supabase-url/avatars/avatar-1627874956.png"
 *       400:
 *         description: No file provided in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that no file was uploaded.
 *                   example: "No file provided"
 *       401:
 *         description: Unauthorized request due to missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the request was unauthorized.
 *                   example: "Unauthorized"
 *       500:
 *         description: Failed to upload the avatar due to a server-side error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the failure in uploading the file.
 *                   example: "Failed to upload avatar"
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server.
 *                   example: "Error uploading file to Supabase storage"
 */


export async function POST(request: Request) {
  try {
    // First verify the user is authenticated
    const accessToken = cookies().get('access_token')?.value
    if (!accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Create a clean filename
    const fileExt = file.name.split('.').pop()
    const cleanFileName = `avatar-${Date.now()}.${fileExt}`

    // Convert File to Buffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload using admin client
    const { data, error } = await supabaseAdmin
      .storage
      .from('avatars')
      .upload(cleanFileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('avatars')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to upload avatar',
        error: error.message 
      },
      { status: 500 }
    )
  }
} 