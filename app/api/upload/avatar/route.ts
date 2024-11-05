import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

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