import { createClient } from '@supabase/supabase-js'

// Supabase 설정
// 실제 프로젝트에서는 환경 변수를 사용하세요
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Supabase가 설정되었는지 확인
const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' &&
    !supabaseUrl.includes('YOUR_SUPABASE_URL')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 인증 상태 확인
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase가 설정되지 않았습니다. .env 파일을 확인해주세요.')
    return null
  }
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error)
    return null
  }
}

// 로그인
export const signIn = async (email, password) => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { message: 'Supabase가 설정되지 않았습니다. README.md를 참고하여 .env 파일을 설정해주세요.' }
    }
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// 회원가입
export const signUp = async (email, password) => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { message: 'Supabase가 설정되지 않았습니다. README.md를 참고하여 .env 파일을 설정해주세요.' }
    }
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// 로그아웃
export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error }
  }
}

// 인증 상태 변경 리스너
export const onAuthStateChange = (callback) => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase가 설정되지 않았습니다.')
    return { data: { subscription: { unsubscribe: () => { } } } }
  }
  try {
    return supabase.auth.onAuthStateChange(callback)
  } catch (error) {
    console.error('인증 상태 리스너 설정 실패:', error)
    return { data: { subscription: { unsubscribe: () => { } } } }
  }
}
