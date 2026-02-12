import QRCode from 'qrcode'

// QR 코드 생성 옵션
const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.95,
    margin: 1,
    width: 300,
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    }
}

// URL QR 코드 생성
export const generateURLQR = async (url, canvas) => {
    if (!url) throw new Error('URL을 입력해주세요')
    await QRCode.toCanvas(canvas, url, defaultOptions)
}

// 텍스트 QR 코드 생성
export const generateTextQR = async (text, canvas) => {
    if (!text) throw new Error('텍스트를 입력해주세요')
    await QRCode.toCanvas(canvas, text, defaultOptions)
}

// SMS QR 코드 생성
export const generateSMSQR = async (phone, message, canvas) => {
    if (!phone) throw new Error('전화번호를 입력해주세요')
    const smsData = `SMSTO:${phone}:${message || ''}`
    await QRCode.toCanvas(canvas, smsData, defaultOptions)
}

// 명함 QR 코드 생성 (vCard)
export const generateVCardQR = async (cardData, canvas) => {
    const { name, company, title, phone, email, website, address } = cardData

    if (!name) throw new Error('이름을 입력해주세요')

    const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        company ? `ORG:${company}` : '',
        title ? `TITLE:${title}` : '',
        phone ? `TEL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        website ? `URL:${website}` : '',
        address ? `ADR:;;${address}` : '',
        'END:VCARD'
    ].filter(line => line).join('\n')

    await QRCode.toCanvas(canvas, vcard, defaultOptions)
}

// Wi-Fi QR 코드 생성
export const generateWiFiQR = async (wifiData, canvas) => {
    const { ssid, password, encryption } = wifiData

    if (!ssid) throw new Error('Wi-Fi 이름(SSID)을 입력해주세요')

    const wifiString = `WIFI:T:${encryption || 'WPA'};S:${ssid};P:${password || ''};H:false;;`
    await QRCode.toCanvas(canvas, wifiString, defaultOptions)
}

// 계좌이체 QR 코드 생성
export const generateBankTransferQR = async (bankData, canvas) => {
    const { bankName, accountNumber, accountHolder, amount } = bankData

    if (!accountNumber) throw new Error('계좌번호를 입력해주세요')

    const transferData = [
        `은행: ${bankName || ''}`,
        `계좌번호: ${accountNumber}`,
        `예금주: ${accountHolder || ''}`,
        amount ? `금액: ${amount}원` : ''
    ].filter(line => line).join('\n')

    await QRCode.toCanvas(canvas, transferData, defaultOptions)
}

// 메뉴 QR 코드 생성
export const generateMenuQR = async (menuData, canvas) => {
    const { restaurantName, items } = menuData

    if (!restaurantName) throw new Error('가게 이름을 입력해주세요')
    if (!items || items.length === 0) throw new Error('메뉴 항목을 추가해주세요')

    const menuText = [
        `📋 ${restaurantName}`,
        '',
        ...items.map(item => `${item.name} - ${item.price}원${item.description ? '\n  ' + item.description : ''}`)
    ].join('\n')

    await QRCode.toCanvas(canvas, menuText, defaultOptions)
}

// QR 코드 다운로드
export const downloadQRCode = (canvas, filename = 'qrcode') => {
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = url
    link.click()
}

// QR 코드를 Base64로 변환
export const canvasToBase64 = (canvas) => {
    return canvas.toDataURL('image/png')
}
