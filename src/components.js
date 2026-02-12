import { generateURLQR, generateTextQR, generateSMSQR, generateVCardQR, generateWiFiQR, generateBankTransferQR, generateMenuQR, downloadQRCode } from './qrGenerator.js'

// URL QR 코드 폼
export const createURLForm = (onGenerate) => {
  return `
    <div class="form-group">
      <label class="form-label" for="url-input">웹사이트 URL</label>
      <input 
        type="url" 
        id="url-input" 
        class="form-input" 
        placeholder="https://example.com"
        required
      />
      <div class="form-helper">전체 URL을 입력해주세요 (http:// 또는 https:// 포함)</div>
    </div>
    <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
      QR 코드 생성
    </button>
  `
}

export const handleURLSubmit = async (e, canvas) => {
  e.preventDefault()
  const url = document.getElementById('url-input').value
  await generateURLQR(url, canvas)
  return { url }
}

// 텍스트 QR 코드 폼
export const createTextForm = () => {
  return `
    <div class="form-group">
      <label class="form-label" for="text-input">텍스트 내용</label>
      <textarea 
        id="text-input" 
        class="form-textarea" 
        placeholder="QR 코드로 변환할 텍스트를 입력하세요"
        required
      ></textarea>
      <div class="form-helper">최대 2,953자까지 입력 가능합니다</div>
    </div>
    <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
      QR 코드 생성
    </button>
  `
}

export const handleTextSubmit = async (e, canvas) => {
  e.preventDefault()
  const text = document.getElementById('text-input').value
  await generateTextQR(text, canvas)
  return { text }
}

// SMS QR 코드 폼
export const createSMSForm = () => {
  return `
    <div class="form-group">
      <label class="form-label" for="sms-phone">전화번호</label>
      <input 
        type="tel" 
        id="sms-phone" 
        class="form-input" 
        placeholder="010-1234-5678"
        required
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="sms-message">메시지 (선택사항)</label>
      <textarea 
        id="sms-message" 
        class="form-textarea" 
        placeholder="미리 작성할 메시지를 입력하세요"
      ></textarea>
    </div>
    <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
      QR 코드 생성
    </button>
  `
}

export const handleSMSSubmit = async (e, canvas) => {
  e.preventDefault()
  const phone = document.getElementById('sms-phone').value
  const message = document.getElementById('sms-message').value
  await generateSMSQR(phone, message, canvas)
  return { phone, message }
}

// 명함 QR 코드 폼
export const createVCardForm = () => {
  return `
    <div class="form-group">
      <label class="form-label" for="vcard-name">이름 *</label>
      <input 
        type="text" 
        id="vcard-name" 
        class="form-input" 
        placeholder="홍길동"
        required
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="vcard-company">회사명</label>
      <input 
        type="text" 
        id="vcard-company" 
        class="form-input" 
        placeholder="(주)회사명"
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="vcard-title">직함</label>
      <input 
        type="text" 
        id="vcard-title" 
        class="form-input" 
        placeholder="대표이사"
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="vcard-phone">전화번호</label>
      <input 
        type="tel" 
        id="vcard-phone" 
        class="form-input" 
        placeholder="010-1234-5678"
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="vcard-email">이메일</label>
      <input 
        type="email" 
        id="vcard-email" 
        class="form-input" 
        placeholder="email@example.com"
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="vcard-website">웹사이트</label>
      <input 
        type="url" 
        id="vcard-website" 
        class="form-input" 
        placeholder="https://example.com"
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="vcard-address">주소</label>
      <input 
        type="text" 
        id="vcard-address" 
        class="form-input" 
        placeholder="서울시 강남구..."
      />
    </div>
    <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
      QR 코드 생성
    </button>
  `
}

export const handleVCardSubmit = async (e, canvas) => {
  e.preventDefault()
  const cardData = {
    name: document.getElementById('vcard-name').value,
    company: document.getElementById('vcard-company').value,
    title: document.getElementById('vcard-title').value,
    phone: document.getElementById('vcard-phone').value,
    email: document.getElementById('vcard-email').value,
    website: document.getElementById('vcard-website').value,
    address: document.getElementById('vcard-address').value,
  }
  await generateVCardQR(cardData, canvas)
  return cardData
}

// Wi-Fi QR 코드 폼
export const createWiFiForm = () => {
  return `
    <div class="form-group">
      <label class="form-label" for="wifi-ssid">Wi-Fi 이름 (SSID) *</label>
      <input 
        type="text" 
        id="wifi-ssid" 
        class="form-input" 
        placeholder="MyWiFi"
        required
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="wifi-password">비밀번호</label>
      <input 
        type="text" 
        id="wifi-password" 
        class="form-input" 
        placeholder="비밀번호 (없으면 비워두세요)"
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="wifi-encryption">암호화 방식</label>
      <select id="wifi-encryption" class="form-select">
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">암호화 없음</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
      QR 코드 생성
    </button>
  `
}

export const handleWiFiSubmit = async (e, canvas) => {
  e.preventDefault()
  const wifiData = {
    ssid: document.getElementById('wifi-ssid').value,
    password: document.getElementById('wifi-password').value,
    encryption: document.getElementById('wifi-encryption').value,
  }
  await generateWiFiQR(wifiData, canvas)
  return wifiData
}

// 계좌이체 QR 코드 폼
export const createBankTransferForm = () => {
  return `
    <div class="form-group">
      <label class="form-label" for="bank-name">은행명</label>
      <input 
        type="text" 
        id="bank-name" 
        class="form-input" 
        placeholder="국민은행"
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="bank-account">계좌번호 *</label>
      <input 
        type="text" 
        id="bank-account" 
        class="form-input" 
        placeholder="123-456-789012"
        required
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="bank-holder">예금주</label>
      <input 
        type="text" 
        id="bank-holder" 
        class="form-input" 
        placeholder="홍길동"
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="bank-amount">금액 (선택사항)</label>
      <input 
        type="number" 
        id="bank-amount" 
        class="form-input" 
        placeholder="10000"
      />
      <div class="form-helper">금액을 지정하지 않으면 사용자가 직접 입력합니다</div>
    </div>
    <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
      QR 코드 생성
    </button>
  `
}

export const handleBankTransferSubmit = async (e, canvas) => {
  e.preventDefault()
  const bankData = {
    bankName: document.getElementById('bank-name').value,
    accountNumber: document.getElementById('bank-account').value,
    accountHolder: document.getElementById('bank-holder').value,
    amount: document.getElementById('bank-amount').value,
  }
  await generateBankTransferQR(bankData, canvas)
  return bankData
}

// 메뉴 QR 코드 폼
export const createMenuForm = () => {
  return `
    <div class="form-group">
      <label class="form-label" for="menu-restaurant">가게 이름 *</label>
      <input 
        type="text" 
        id="menu-restaurant" 
        class="form-input" 
        placeholder="맛있는 식당"
        required
      />
    </div>
    <div class="form-group">
      <label class="form-label">메뉴 항목</label>
      <div id="menu-items-container">
        <div class="menu-item" style="margin-bottom: 1rem; padding: 1rem; background: var(--color-bg-secondary); border-radius: var(--radius-md);">
          <input 
            type="text" 
            class="form-input menu-item-name" 
            placeholder="메뉴 이름"
            style="margin-bottom: 0.5rem;"
          />
          <input 
            type="number" 
            class="form-input menu-item-price" 
            placeholder="가격"
            style="margin-bottom: 0.5rem;"
          />
          <input 
            type="text" 
            class="form-input menu-item-desc" 
            placeholder="설명 (선택사항)"
          />
        </div>
      </div>
      <button type="button" id="add-menu-item" class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem;">
        + 메뉴 추가
      </button>
    </div>
    <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 1rem;">
      QR 코드 생성
    </button>
  `
}

export const handleMenuFormSetup = () => {
  const addButton = document.getElementById('add-menu-item')
  const container = document.getElementById('menu-items-container')

  addButton.addEventListener('click', () => {
    const menuItem = document.createElement('div')
    menuItem.className = 'menu-item'
    menuItem.style.cssText = 'margin-bottom: 1rem; padding: 1rem; background: var(--color-bg-secondary); border-radius: var(--radius-md); position: relative;'
    menuItem.innerHTML = `
      <input 
        type="text" 
        class="form-input menu-item-name" 
        placeholder="메뉴 이름"
        style="margin-bottom: 0.5rem;"
      />
      <input 
        type="number" 
        class="form-input menu-item-price" 
        placeholder="가격"
        style="margin-bottom: 0.5rem;"
      />
      <input 
        type="text" 
        class="form-input menu-item-desc" 
        placeholder="설명 (선택사항)"
      />
      <button type="button" class="btn btn-ghost btn-sm remove-menu-item" style="position: absolute; top: 0.5rem; right: 0.5rem;">
        ✕
      </button>
    `
    container.appendChild(menuItem)

    menuItem.querySelector('.remove-menu-item').addEventListener('click', () => {
      menuItem.remove()
    })
  })
}

export const handleMenuSubmit = async (e, canvas) => {
  e.preventDefault()
  const restaurantName = document.getElementById('menu-restaurant').value
  const menuItems = Array.from(document.querySelectorAll('.menu-item')).map(item => ({
    name: item.querySelector('.menu-item-name').value,
    price: item.querySelector('.menu-item-price').value,
    description: item.querySelector('.menu-item-desc').value,
  })).filter(item => item.name && item.price)

  const menuData = { restaurantName, items: menuItems }
  await generateMenuQR(menuData, canvas)
  return menuData
}
