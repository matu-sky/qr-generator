import './style.css'
import { getCurrentUser, signIn, signUp, signOut, onAuthStateChange } from './supabase.js'
import { downloadQRCode, canvasToBase64 } from './qrGenerator.js'
import {
  createURLForm, handleURLSubmit,
  createTextForm, handleTextSubmit,
  createSMSForm, handleSMSSubmit,
  createVCardForm, handleVCardSubmit,
  createWiFiForm, handleWiFiSubmit,
  createBankTransferForm, handleBankTransferSubmit,
  createMenuForm, handleMenuSubmit, handleMenuFormSetup
} from './components.js'
import { saveQRCode, getUserQRCodes, deleteQRCode } from './qrDatabase.js'

// 앱 상태
let currentUser = null
let currentCanvas = null
let currentQRData = null // 현재 생성된 QR 코드 데이터
let currentQRType = 'url' // 현재 선택된 QR 타입
let showHistory = false // 히스토리 표시 여부
let qrHistory = [] // QR 코드 히스토리

// QR 코드 타입 정의
const QR_TYPES = [
  { id: 'url', name: 'URL', icon: '🔗', description: '웹사이트 링크' },
  { id: 'text', name: '텍스트', icon: '📝', description: '일반 텍스트' },
  { id: 'sms', name: 'SMS', icon: '💬', description: '문자 메시지' },
  { id: 'vcard', name: '명함', icon: '👤', description: '연락처 정보' },
  { id: 'wifi', name: 'Wi-Fi', icon: '📶', description: 'Wi-Fi 연결' },
  { id: 'bank', name: '계좌이체', icon: '💳', description: '계좌 정보' },
  { id: 'menu', name: '메뉴', icon: '🍽️', description: '식당/카페 메뉴' },
]

// 앱 초기화
const initApp = async () => {
  currentUser = await getCurrentUser()

  // 인증 상태 변경 리스너
  onAuthStateChange((event, session) => {
    currentUser = session?.user || null
    renderApp()
  })

  renderApp()
}

// 앱 렌더링
const renderApp = () => {
  const app = document.getElementById('app')

  if (!currentUser) {
    app.innerHTML = renderAuthPage()
    setupAuthListeners()
  } else {
    app.innerHTML = renderMainPage()
    setupMainListeners()
  }
}

// 인증 페이지 렌더링
const renderAuthPage = () => {
  return `
    <div class="auth-container">
      <div class="auth-card animate-fadeIn">
        <div class="auth-header">
          <div class="auth-logo">QR</div>
          <h1 class="auth-title">QR 코드 생성기</h1>
          <p class="auth-subtitle">전문적인 QR 코드를 쉽고 빠르게 생성하세요</p>
        </div>
        
        <div id="auth-form-container">
          ${renderLoginForm()}
        </div>
      </div>
    </div>
  `
}

// 로그인 폼
const renderLoginForm = () => {
  return `
    <form id="login-form">
      <div class="form-group">
        <label class="form-label" for="login-email">이메일</label>
        <input 
          type="email" 
          id="login-email" 
          class="form-input" 
          placeholder="your@email.com"
          required
        />
      </div>
      <div class="form-group">
        <label class="form-label" for="login-password">비밀번호</label>
        <input 
          type="password" 
          id="login-password" 
          class="form-input" 
          placeholder="••••••••"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
        로그인
      </button>
      <div class="auth-footer">
        계정이 없으신가요? 
        <a href="#" id="show-signup" class="auth-link">회원가입</a>
      </div>
    </form>
  `
}

// 회원가입 폼
const renderSignupForm = () => {
  return `
    <form id="signup-form">
      <div class="form-group">
        <label class="form-label" for="signup-email">이메일</label>
        <input 
          type="email" 
          id="signup-email" 
          class="form-input" 
          placeholder="your@email.com"
          required
        />
      </div>
      <div class="form-group">
        <label class="form-label" for="signup-password">비밀번호</label>
        <input 
          type="password" 
          id="signup-password" 
          class="form-input" 
          placeholder="••••••••"
          required
        />
        <div class="form-helper">최소 6자 이상 입력해주세요</div>
      </div>
      <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
        회원가입
      </button>
      <div class="auth-footer">
        이미 계정이 있으신가요? 
        <a href="#" id="show-login" class="auth-link">로그인</a>
      </div>
    </form>
  `
}

// 메인 페이지 렌더링
const renderMainPage = () => {
  return `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a href="#" class="logo">
            <div class="logo-icon">QR</div>
            <span>QR 코드 생성기</span>
          </a>
          <div class="nav-actions">
            <button id="history-btn" class="btn btn-secondary">
              📋 히스토리
            </button>
            <div class="user-info">
              <div class="user-avatar">${currentUser.email[0].toUpperCase()}</div>
              <span>${currentUser.email}</span>
            </div>
            <button id="logout-btn" class="btn btn-ghost">로그아웃</button>
          </div>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <div class="container">
        <div class="page-header text-center">
          <h1 class="page-title">QR 코드 생성기</h1>
          <p class="page-description">다양한 종류의 QR 코드를 쉽고 빠르게 생성하세요</p>
        </div>
        
        <div class="grid grid-2">
          <div class="card animate-fadeIn">
            <div class="card-header">
              <h2 class="card-title">QR 코드 타입 선택</h2>
              <p class="card-subtitle">생성하고 싶은 QR 코드 종류를 선택하세요</p>
            </div>
            
            <div class="tabs">
              <ul class="tabs-list">
                ${QR_TYPES.map((type, index) => `
                  <li>
                    <button 
                      class="tab-button ${index === 0 ? 'active' : ''}" 
                      data-tab="${type.id}"
                    >
                      <span class="tab-icon">${type.icon}</span>
                      ${type.name}
                    </button>
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <div class="card-body">
              <form id="qr-form">
                <div id="form-content"></div>
              </form>
            </div>
          </div>
          
          <div class="card animate-fadeIn" style="animation-delay: 100ms;">
            <div class="card-header">
              <h2 class="card-title">QR 코드 미리보기</h2>
              <p class="card-subtitle">생성된 QR 코드가 여기에 표시됩니다</p>
            </div>
            
            <div class="card-body">
              <div class="qr-display">
                <canvas id="qr-canvas" class="qr-canvas hidden"></canvas>
                <div id="qr-placeholder" class="qr-placeholder">
                  <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
                    <div>QR 코드를 생성하면 여기에 표시됩니다</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <button id="save-btn" class="btn btn-secondary" disabled>
                💾 저장
              </button>
              <button id="download-btn" class="btn btn-primary" disabled>
                다운로드
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
}

// 인증 리스너 설정
const setupAuthListeners = () => {
  const loginForm = document.getElementById('login-form')
  const signupForm = document.getElementById('signup-form')
  const showSignup = document.getElementById('show-signup')
  const showLogin = document.getElementById('show-login')

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = document.getElementById('login-email').value
      const password = document.getElementById('login-password').value

      const { error } = await signIn(email, password)
      if (error) {
        alert('로그인 실패: ' + error.message)
      }
    })
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = document.getElementById('signup-email').value
      const password = document.getElementById('signup-password').value

      const { error } = await signUp(email, password)
      if (error) {
        alert('회원가입 실패: ' + error.message)
      } else {
        alert('회원가입 성공! 이메일을 확인해주세요.')
      }
    })
  }

  if (showSignup) {
    showSignup.addEventListener('click', (e) => {
      e.preventDefault()
      document.getElementById('auth-form-container').innerHTML = renderSignupForm()
      setupAuthListeners()
    })
  }

  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault()
      document.getElementById('auth-form-container').innerHTML = renderLoginForm()
      setupAuthListeners()
    })
  }
}

// 메인 페이지 리스너 설정
const setupMainListeners = () => {
  const logoutBtn = document.getElementById('logout-btn')
  const tabButtons = document.querySelectorAll('.tab-button')
  const downloadBtn = document.getElementById('download-btn')
  currentCanvas = document.getElementById('qr-canvas')

  // 로그아웃
  logoutBtn.addEventListener('click', async () => {
    await signOut()
  })

  // 탭 전환
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'))
      button.classList.add('active')

      const tabId = button.dataset.tab
      currentQRType = tabId // 현재 타입 저장
      loadFormForTab(tabId)
    })
  })

  // 다운로드
  downloadBtn.addEventListener('click', () => {
    const activeTab = document.querySelector('.tab-button.active')
    const tabName = activeTab ? activeTab.dataset.tab : 'qrcode'
    downloadQRCode(currentCanvas, `${tabName}-qrcode`)
  })

  // 저장
  const saveBtn = document.getElementById('save-btn')
  saveBtn.addEventListener('click', async () => {
    if (!currentQRData) return

    saveBtn.disabled = true
    saveBtn.textContent = '저장 중...'

    const imageData = canvasToBase64(currentCanvas)
    const { error } = await saveQRCode(currentQRType, currentQRData, imageData)

    if (error) {
      alert('저장 실패: ' + error.message)
      saveBtn.disabled = false
      saveBtn.textContent = '💾 저장'
    } else {
      alert('QR 코드가 저장되었습니다!')
      saveBtn.textContent = '✅ 저장됨'
      // 히스토리 갱신 (열려있을 경우)
      if (showHistory) {
        loadHistory()
      }
    }
  })

  // 히스토리 버튼
  const historyBtn = document.getElementById('history-btn')
  historyBtn.addEventListener('click', () => {
    showHistory = !showHistory
    if (showHistory) {
      document.body.insertAdjacentHTML('beforeend', renderHistoryModal())
      setupHistoryListeners()
      loadHistory()
    } else {
      removeHistoryModal()
    }
  })

  // 첫 번째 탭 로드
  loadFormForTab('url')
}

// 히스토리 모달 렌더링
const renderHistoryModal = () => {
  return `
    <div id="history-modal" class="modal-overlay animate-fadeIn">
      <div class="modal-content animate-slideIn">
        <div class="modal-header">
          <h2 class="modal-title">나의 QR 코드 히스토리</h2>
          <button id="close-history" class="btn btn-ghost">✕</button>
        </div>
        <div id="history-list" class="history-list">
          <div class="text-center py-lg">
            <div class="loading"></div>
            <p>불러오는 중...</p>
          </div>
        </div>
      </div>
    </div>
  `
}

const setupHistoryListeners = () => {
  const closeBtn = document.getElementById('close-history')
  const overlay = document.getElementById('history-modal')

  closeBtn.addEventListener('click', removeHistoryModal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) removeHistoryModal()
  })
}

const removeHistoryModal = () => {
  const modal = document.getElementById('history-modal')
  if (modal) modal.remove()
  showHistory = false
}

const loadHistory = async () => {
  const historyList = document.getElementById('history-list')
  const { data, error } = await getUserQRCodes()

  if (error) {
    historyList.innerHTML = `<p class="text-error text-center">오류: ${error.message}</p>`
    return
  }

  if (!data || data.length === 0) {
    historyList.innerHTML = `
      <div class="text-center py-xl">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
        <p>아직 저장된 QR 코드가 없습니다.</p>
      </div>
    `
    return
  }

  historyList.innerHTML = `
    <div class="history-grid">
      ${data.map(item => `
        <div class="history-item card" data-id="${item.id}">
          <div class="history-preview">
            <img src="${item.image_data}" alt="QR Code" />
          </div>
          <div class="history-info">
            <div class="history-type">${item.type.toUpperCase()}</div>
            <div class="history-date">${new Date(item.created_at).toLocaleDateString()}</div>
          </div>
          <div class="history-actions">
            <button class="btn btn-sm btn-ghost delete-qr" data-id="${item.id}">삭제</button>
            <button class="btn btn-sm btn-primary download-history-qr" data-id="${item.id}">다운로드</button>
          </div>
        </div>
      `).join('')}
    </div>
  `

  // 히스토리 액션 리스너
  document.querySelectorAll('.delete-qr').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const id = btn.dataset.id
      if (confirm('정말 삭제하시겠습니까?')) {
        const { error } = await deleteQRCode(id)
        if (error) alert('삭제 실패: ' + error.message)
        else loadHistory()
      }
    })
  })

  document.querySelectorAll('.download-history-qr').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const item = data.find(d => d.id === btn.dataset.id)
      const link = document.createElement('a')
      link.href = item.image_data
      link.download = `${item.type}-qrcode-${item.id.slice(0, 8)}.png`
      link.click()
    })
  })
}

// 탭에 맞는 폼 로드
const loadFormForTab = (tabId) => {
  const formContent = document.getElementById('form-content')
  const qrForm = document.getElementById('qr-form')

  // 기존 이벤트 리스너 제거를 위해 폼을 복제
  const newForm = qrForm.cloneNode(false)
  qrForm.parentNode.replaceChild(newForm, qrForm)

  const formContentNew = document.createElement('div')
  formContentNew.id = 'form-content'
  newForm.appendChild(formContentNew)

  let formHTML = ''
  let submitHandler = null

  switch (tabId) {
    case 'url':
      formHTML = createURLForm()
      submitHandler = handleURLSubmit
      break
    case 'text':
      formHTML = createTextForm()
      submitHandler = handleTextSubmit
      break
    case 'sms':
      formHTML = createSMSForm()
      submitHandler = handleSMSSubmit
      break
    case 'vcard':
      formHTML = createVCardForm()
      submitHandler = handleVCardSubmit
      break
    case 'wifi':
      formHTML = createWiFiForm()
      submitHandler = handleWiFiSubmit
      break
    case 'bank':
      formHTML = createBankTransferForm()
      submitHandler = handleBankTransferSubmit
      break
    case 'menu':
      formHTML = createMenuForm()
      submitHandler = handleMenuSubmit
      setTimeout(() => handleMenuFormSetup(), 0)
      break
  }

  formContentNew.innerHTML = formHTML

  // 폼 제출 이벤트
  newForm.addEventListener('submit', async (e) => {
    try {
      const data = await submitHandler(e, currentCanvas)
      currentQRData = data // 생성된 데이터 저장

      // QR 코드 표시
      document.getElementById('qr-canvas').classList.remove('hidden')
      document.getElementById('qr-placeholder').classList.add('hidden')
      document.getElementById('download-btn').disabled = false

      const saveBtn = document.getElementById('save-btn')
      saveBtn.disabled = false
      saveBtn.textContent = '💾 저장'
    } catch (error) {
      alert('오류: ' + error.message)
    }
  })
}

// 앱 시작
initApp()
