import { supabase } from './supabase.js'

// QR 코드 저장
export const saveQRCode = async (type, data, imageData, options = {}, title = null) => {
    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('로그인이 필요합니다.')
        }

        const { data: qrCode, error } = await supabase
            .from('qr_codes')
            .insert([
                {
                    user_id: user.id,
                    type,
                    data,
                    options,
                    image_data: imageData,
                    title
                }
            ])
            .select()
            .single()

        if (error) throw error

        return { data: qrCode, error: null }
    } catch (error) {
        console.error('QR 코드 저장 실패:', error)
        return { data: null, error }
    }
}

// 사용자의 모든 QR 코드 가져오기
export const getUserQRCodes = async (limit = 50, offset = 0) => {
    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('로그인이 필요합니다.')
        }

        const { data, error } = await supabase
            .from('qr_codes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        return { data, error: null }
    } catch (error) {
        console.error('QR 코드 목록 가져오기 실패:', error)
        return { data: null, error }
    }
}

// 특정 QR 코드 가져오기
export const getQRCodeById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('qr_codes')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        return { data, error: null }
    } catch (error) {
        console.error('QR 코드 가져오기 실패:', error)
        return { data: null, error }
    }
}

// QR 코드 삭제
export const deleteQRCode = async (id) => {
    try {
        const { error } = await supabase
            .from('qr_codes')
            .delete()
            .eq('id', id)

        if (error) throw error

        return { error: null }
    } catch (error) {
        console.error('QR 코드 삭제 실패:', error)
        return { error }
    }
}

// QR 코드 업데이트
export const updateQRCode = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('qr_codes')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return { data, error: null }
    } catch (error) {
        console.error('QR 코드 업데이트 실패:', error)
        return { data: null, error }
    }
}

// 타입별 QR 코드 개수 가져오기
export const getQRCodeCountByType = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('로그인이 필요합니다.')
        }

        const { data, error } = await supabase
            .from('qr_codes')
            .select('type')
            .eq('user_id', user.id)

        if (error) throw error

        // 타입별로 개수 집계
        const counts = data.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1
            return acc
        }, {})

        return { data: counts, error: null }
    } catch (error) {
        console.error('QR 코드 통계 가져오기 실패:', error)
        return { data: null, error }
    }
}
