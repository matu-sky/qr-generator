import './style.css'
import { getCurrentUser, signIn, signUp, signOut, onAuthStateChange } from './supabase.js'
import {
  downloadQRCode, canvasToBase64,
  generateURLQR, generateTextQR, generateSMSQR,
  generateVCardQR, generateWiFiQR, generateBankTransferQR, generateMenuQR
} from './qrGenerator.js'
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

// QR 코드 옵션 상태
let qrOptions = {
  darkColor: '#000000',
  lightColor: '#FFFFFF',
  errorCorrectionLevel: 'M',
  margin: 1
}

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
              <span class="user-email-text">${currentUser.email}</span>
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
          <div class="column-left">
            <div class="card animate-fadeIn">
              <div class="card-header">
                <h2 class="card-title">1. 데이터 입력</h2>
                <p class="card-subtitle">생성하고 싶은 QR 코드 종류와 내용을 입력하세요</p>
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

            <div class="card animate-fadeIn mt-xl" style="animation-delay: 50ms;">
              <div class="card-header flex justify-between items-center">
                <div>
                  <h2 class="card-title">2. 디자인 설정</h2>
                  <p class="card-subtitle">QR 코드의 색상과 스타일을 커스텀하세요</p>
                </div>
                <button id="reset-design-btn" class="btn btn-ghost btn-sm">
                  🔄 초기화
                </button>
              </div>
              <div class="card-body">
                <div class="design-settings">
                  <div class="grid grid-2">
                    <div class="form-group">
                      <label class="form-label">기본 색상 (Dark)</label>
                      <div class="color-picker-wrapper">
                        <input type="color" id="dark-color" value="${qrOptions.darkColor}" class="color-input">
                        <span class="color-value">${qrOptions.darkColor}</span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">배경 색상 (Light)</label>
                      <div class="color-picker-wrapper">
                        <input type="color" id="light-color" value="${qrOptions.lightColor}" class="color-input">
                        <span class="color-value">${qrOptions.lightColor}</span>
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-2">
                    <div class="form-group">
                      <label class="form-label">오류 복구 수준</label>
                      <select id="error-level" class="form-select">
                        <option value="L" ${qrOptions.errorCorrectionLevel === 'L' ? 'selected' : ''}>낮음 (7%)</option>
                        <option value="M" ${qrOptions.errorCorrectionLevel === 'M' ? 'selected' : ''}>중간 (15%)</option>
                        <option value="Q" ${qrOptions.errorCorrectionLevel === 'Q' ? 'selected' : ''}>높음 (25%)</option>
                        <option value="H" ${qrOptions.errorCorrectionLevel === 'H' ? 'selected' : ''}>최고 (30%)</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">여백 (Margin)</label>
                      <input type="range" id="qr-margin" min="0" max="10" value="${qrOptions.margin}" class="range-input">
                      <div class="flex justify-between mt-xs">
                        <span class="text-xs">0</span>
                        <span id="margin-value" class="text-xs font-bold">${qrOptions.margin}</span>
                        <span class="text-xs">10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="column-right">
            <div class="card animate-fadeIn sticky-preview" style="animation-delay: 100ms;">
              <div class="card-header">
                <h2 class="card-title">3. 미리보기</h2>
                <p class="card-subtitle">설정에 따라 실시간으로 반영됩니다</p>
              </div>
              
              <div class="card-body">
                <div class="qr-display-container">
                  <div class="qr-display">
                    <canvas id="qr-canvas" class="qr-canvas hidden"></canvas>
                    <div id="qr-placeholder" class="qr-placeholder">
                      <div class="text-center">
                        <div class="placeholder-icon">📱</div>
                        <p>데이터를 입력하면<br>QR 코드가 생성됩니다</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card-footer preview-actions">
                <button id="save-btn" class="btn btn-secondary" disabled title="데이터베이스에 저장">
                  💾 저장하기
                </button>
                <button id="copy-btn" class="btn btn-secondary" disabled title="이미지로 복사">
                  📋 복사
                </button>
                <button id="download-btn" class="btn btn-primary" disabled title="이미지로 다운로드">
                  다운로드
                </button>
              </div>
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

      // 상태 및 프리뷰 초기화
      currentQRData = null
      currentCanvas.classList.add('hidden')
      document.getElementById('qr-placeholder').classList.remove('hidden')
      document.getElementById('download-btn').disabled = true
      document.getElementById('save-btn').disabled = true
      document.getElementById('copy-btn').disabled = true

      loadFormForTab(tabId)
    })
  })

  // 디자인 설정 리스너
  const darkColorInput = document.getElementById('dark-color')
  const lightColorInput = document.getElementById('light-color')
  const errorLevelSelect = document.getElementById('error-level')
  const marginInput = document.getElementById('qr-margin')
  const marginValue = document.getElementById('margin-value')

  darkColorInput?.addEventListener('input', (e) => {
    qrOptions.darkColor = e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    regenerateQR()
  })

  lightColorInput?.addEventListener('input', (e) => {
    qrOptions.lightColor = e.target.value
    e.target.nextElementSibling.textContent = e.target.value
    regenerateQR()
  })

  errorLevelSelect?.addEventListener('change', (e) => {
    qrOptions.errorCorrectionLevel = e.target.value
    regenerateQR()
  })

  marginInput?.addEventListener('input', (e) => {
    const value = parseInt(e.target.value)
    qrOptions.margin = value
    if (marginValue) marginValue.textContent = value
    regenerateQR()
  })

  // 디자인 초기화
  const resetDesignBtn = document.getElementById('reset-design-btn')
  resetDesignBtn?.addEventListener('click', () => {
    qrOptions = {
      darkColor: '#000000',
      lightColor: '#FFFFFF',
      errorCorrectionLevel: 'M',
      margin: 1
    }
    // UI 업데이트
    if (darkColorInput) {
      darkColorInput.value = qrOptions.darkColor
      darkColorInput.nextElementSibling.textContent = qrOptions.darkColor
    }
    if (lightColorInput) {
      lightColorInput.value = qrOptions.lightColor
      lightColorInput.nextElementSibling.textContent = qrOptions.lightColor
    }
    if (errorLevelSelect) errorLevelSelect.value = qrOptions.errorCorrectionLevel
    if (marginInput) {
      marginInput.value = qrOptions.margin
      if (marginValue) marginValue.textContent = qrOptions.margin
    }
    regenerateQR()
  })

  // 다운로드
  downloadBtn.addEventListener('click', () => {
    const activeTab = document.querySelector('.tab-button.active')
    const tabName = activeTab ? activeTab.dataset.tab : 'qrcode'
    downloadQRCode(currentCanvas, `${tabName}-qrcode`)
  })

  // 이미지 복사
  const copyBtn = document.getElementById('copy-btn')
  copyBtn?.addEventListener('click', async () => {
    try {
      currentCanvas.toBlob(async (blob) => {
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
        copyBtn.textContent = '✅ 복사됨'
        setTimeout(() => { copyBtn.textContent = '📋 복사' }, 2000)
      })
    } catch (err) {
      console.error('이미지 복사 실패:', err)
      alert('이미지 복사를 지원하지 않는 브라우저입니다.')
    }
  })

  // 저장
  const saveBtn = document.getElementById('save-btn')
  saveBtn.addEventListener('click', async () => {
    if (!currentQRData) return

    saveBtn.disabled = true
    saveBtn.textContent = '저장 중...'

    const imageData = canvasToBase64(currentCanvas)
    const { error } = await saveQRCode(currentQRType, currentQRData, imageData, qrOptions)

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

// QR 리제너레이션 (디자인 설정 변경 시)
const regenerateQR = async () => {
  if (!currentQRData) return

  try {
    const canvas = document.getElementById('qr-canvas')
    if (!canvas) {
      console.warn('QR canvas element not found for regeneration.')
      return
    }

    // 디자인 변경 시에도 미리보기 보이기
    canvas.classList.remove('hidden')
    const placeholder = document.getElementById('qr-placeholder')
    if (placeholder) placeholder.classList.add('hidden')

    switch (currentQRType) {
      case 'url': await generateURLQR(currentQRData.url, canvas, qrOptions); break
      case 'text': await generateTextQR(currentQRData.text, canvas, qrOptions); break
      case 'sms': await generateSMSQR(currentQRData.phone, currentQRData.message, canvas, qrOptions); break
      case 'vcard': await generateVCardQR(currentQRData, canvas, qrOptions); break
      case 'wifi': await generateWiFiQR(currentQRData, canvas, qrOptions); break
      case 'bank': await generateBankTransferQR(currentQRData, canvas, qrOptions); break
      case 'menu': await generateMenuQR(currentQRData, canvas, qrOptions); break
      default: console.warn('Unknown QR type for regeneration:', currentQRType); break
    }
    console.log(`QR regenerated for type: ${currentQRType}`);
  } catch (error) {
    console.error('QR 재생성 오류:', error)
  }
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
            <button class="btn btn-sm btn-secondary load-qr" data-id="${item.id}">불러오기</button>
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

  document.querySelectorAll('.load-qr').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const item = data.find(d => d.id === btn.dataset.id)
      loadQRCodeData(item)
      removeHistoryModal()
    })
  })
}

const loadQRCodeData = (item) => {
  const { type, data, options } = item
  currentQRType = type
  currentQRData = data
  if (options) {
    qrOptions = { ...qrOptions, ...options }
  }

  // 데이터 로드 알림
  console.log('Loading QR data:', type, data)

  // 탭 버튼 상태 업데이트
  document.querySelectorAll('.tab-button').forEach(btn => {
    if (btn.dataset.tab === type) btn.classList.add('active')
    else btn.classList.remove('active')
  })

  // 디자인 설정 UI 업데이트
  const darkInput = document.getElementById('dark-color')
  const lightInput = document.getElementById('light-color')
  const errorSelect = document.getElementById('error-level')
  const marginRange = document.getElementById('qr-margin')
  const marginTxt = document.getElementById('margin-value')

  if (darkInput) {
    darkInput.value = qrOptions.darkColor
    darkInput.nextElementSibling.textContent = qrOptions.darkColor
  }
  if (lightInput) {
    lightInput.value = qrOptions.lightColor
    lightInput.nextElementSibling.textContent = qrOptions.lightColor
  }
  if (errorSelect) errorSelect.value = qrOptions.errorCorrectionLevel
  if (marginRange) {
    marginRange.value = qrOptions.margin
    if (marginTxt) marginTxt.textContent = qrOptions.margin
  }

  // 폼 로드 및 데이터 채우기
  loadFormForTab(type, data)

  // QR 코드 미리보기 즉시 생성
  setTimeout(() => {
    regenerateQR()
    // 버튼 활성화
    document.getElementById('qr-canvas').classList.remove('hidden')
    document.getElementById('qr-placeholder').classList.add('hidden')
    document.getElementById('download-btn').disabled = false
    document.getElementById('copy-btn').disabled = false
    document.getElementById('save-btn').disabled = false
  }, 100)
}

// 탭에 맞는 폼 로드
const loadFormForTab = (tabId, initialData = null) => {
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

  // 초기 데이터가 있을 경우 폼 필드 채우기
  if (initialData) {
    setTimeout(() => {
      fillFormWithData(tabId, initialData)
    }, 0)
  }

  // 폼 제출 이벤트
  newForm.addEventListener('submit', async (e) => {
    try {
      const canvas = document.getElementById('qr-canvas')
      const placeholder = document.getElementById('qr-placeholder')

      // 1. 먼저 캔버스를 표시 (일부 라이브러리/브라우저 이슈 방지)
      canvas.classList.remove('hidden')
      placeholder.classList.add('hidden')

      // 2. QR 코드 생성
      const data = await submitHandler(e, canvas, qrOptions)
      currentQRData = data // 생성된 데이터 저장

      // 3. 버튼 활성화
      document.getElementById('download-btn').disabled = false
      document.getElementById('copy-btn').disabled = false

      const saveBtn = document.getElementById('save-btn')
      saveBtn.disabled = false
      saveBtn.textContent = '💾 저장'
    } catch (error) {
      console.error('QR 생성 오류:', error)
      alert('오류: ' + error.message)
    }
  })
}

// 폼에 데이터 채우기
const fillFormWithData = (tabId, data) => {
  switch (tabId) {
    case 'url':
      if (document.getElementById('url-input')) document.getElementById('url-input').value = data.url || ''
      break
    case 'text':
      if (document.getElementById('text-input')) document.getElementById('text-input').value = data.text || ''
      break
    case 'sms':
      if (document.getElementById('sms-phone')) document.getElementById('sms-phone').value = data.phone || ''
      if (document.getElementById('sms-message')) document.getElementById('sms-message').value = data.message || ''
      break
    case 'vcard':
      if (document.getElementById('vcard-name')) document.getElementById('vcard-name').value = data.name || ''
      if (document.getElementById('vcard-company')) document.getElementById('vcard-company').value = data.company || ''
      if (document.getElementById('vcard-title')) document.getElementById('vcard-title').value = data.title || ''
      if (document.getElementById('vcard-phone')) document.getElementById('vcard-phone').value = data.phone || ''
      if (document.getElementById('vcard-email')) document.getElementById('vcard-email').value = data.email || ''
      if (document.getElementById('vcard-website')) document.getElementById('vcard-website').value = data.website || ''
      if (document.getElementById('vcard-address')) document.getElementById('vcard-address').value = data.address || ''
      break
    case 'wifi':
      if (document.getElementById('wifi-ssid')) document.getElementById('wifi-ssid').value = data.ssid || ''
      if (document.getElementById('wifi-password')) document.getElementById('wifi-password').value = data.password || ''
      if (document.getElementById('wifi-encryption')) document.getElementById('wifi-encryption').value = data.encryption || 'WPA'
      break
    case 'bank':
      if (document.getElementById('bank-name')) document.getElementById('bank-name').value = data.bankName || ''
      if (document.getElementById('bank-account')) document.getElementById('bank-account').value = data.accountNumber || ''
      if (document.getElementById('bank-holder')) document.getElementById('bank-holder').value = data.accountHolder || ''
      if (document.getElementById('bank-amount')) document.getElementById('bank-amount').value = data.amount || ''
      break
    case 'menu':
      if (document.getElementById('menu-restaurant')) document.getElementById('menu-restaurant').value = data.restaurantName || ''
      if (data.items && data.items.length > 0) {
        const container = document.getElementById('menu-items-container')
        if (container) {
          container.innerHTML = '' // 기본 항목 제거
          data.items.forEach(item => {
            const menuItem = document.createElement('div')
            menuItem.className = 'menu-item'
            menuItem.style.cssText = 'margin-bottom: 1rem; padding: 1rem; background: var(--color-bg-secondary); border-radius: var(--radius-md); position: relative;'
            menuItem.innerHTML = `
              <input type="text" class="form-input menu-item-name" placeholder="메뉴 이름" style="margin-bottom: 0.5rem;" value="${item.name || ''}" />
              <input type="number" class="form-input menu-item-price" placeholder="가격" style="margin-bottom: 0.5rem;" value="${item.price || ''}" />
              <input type="text" class="form-input menu-item-desc" placeholder="설명 (선택사항)" value="${item.description || ''}" />
              <button type="button" class="btn btn-ghost btn-sm remove-menu-item" style="position: absolute; top: 0.5rem; right: 0.5rem;">✕</button>
            `
            container.appendChild(menuItem)
            menuItem.querySelector('.remove-menu-item').addEventListener('click', () => menuItem.remove())
          })
        }
      }
      break
  }
}

// 앱 시작
initApp()
