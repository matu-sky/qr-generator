import * as QRCode from 'qrcode'

// QR 코드 생성 옵션
const getOptions = (customOptions = {}) => {
    return {
        errorCorrectionLevel: customOptions.errorCorrectionLevel || 'M',
        type: 'image/png',
        quality: 0.95,
        margin: customOptions.margin ?? 1,
        width: 300,
        color: {
            dark: customOptions.darkColor || '#000000',
            light: customOptions.lightColor || '#FFFFFF'
        }
    }
}

// URL QR 코드 생성
export const generateURLQR = async (url, canvas, options = {}) => {
    try {
        if (!url) throw new Error('URL을 입력해주세요')
        console.log('Generating URL QR:', url, options)
        await QRCode.toCanvas(canvas, url, getOptions(options))
        console.log('URL QR generated successfully')
    } catch (err) {
        console.error('URL QR generation error:', err)
        throw err
    }
}

// 텍스트 QR 코드 생성
export const generateTextQR = async (text, canvas, options = {}) => {
    try {
        if (!text) throw new Error('텍스트를 입력해주세요')
        console.log('Generating Text QR:', text, options)
        await QRCode.toCanvas(canvas, text, getOptions(options))
        console.log('Text QR generated successfully')
    } catch (err) {
        console.error('Text QR generation error:', err)
        throw err
    }
}

// SMS QR 코드 생성
export const generateSMSQR = async (phone, message, canvas, options = {}) => {
    try {
        if (!phone) throw new Error('전화번호를 입력해주세요')
        const smsData = `SMSTO:${phone}:${message || ''}`
        console.log('Generating SMS QR:', smsData, options)
        await QRCode.toCanvas(canvas, smsData, getOptions(options))
        console.log('SMS QR generated successfully')
    } catch (err) {
        console.error('SMS QR generation error:', err)
        throw err
    }
}

// 명함 QR 코드 생성 (vCard)
export const generateVCardQR = async (cardData, canvas, options = {}) => {
    try {
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

        console.log('Generating vCard QR:', vcard, options)
        await QRCode.toCanvas(canvas, vcard, getOptions(options))
        console.log('vCard QR generated successfully')
    } catch (err) {
        console.error('vCard QR generation error:', err)
        throw err
    }
}

// Wi-Fi QR 코드 생성
export const generateWiFiQR = async (wifiData, canvas, options = {}) => {
    try {
        const { ssid, password, encryption } = wifiData
        if (!ssid) throw new Error('Wi-Fi 이름(SSID)을 입력해주세요')

        const wifiString = `WIFI:T:${encryption || 'WPA'};S:${ssid};P:${password || ''};H:false;;`
        console.log('Generating WiFi QR:', wifiString, options)
        await QRCode.toCanvas(canvas, wifiString, getOptions(options))
        console.log('WiFi QR generated successfully')
    } catch (err) {
        console.error('WiFi QR generation error:', err)
        throw err
    }
}

// 계좌이체 QR 코드 생성
export const generateBankTransferQR = async (bankData, canvas, options = {}) => {
    try {
        const { bankName, accountNumber, accountHolder, amount } = bankData
        if (!accountNumber) throw new Error('계좌번호를 입력해주세요')

        const transferData = [
            `은행: ${bankName || ''}`,
            `계좌번호: ${accountNumber}`,
            `예금주: ${accountHolder || ''}`,
            amount ? `금액: ${amount}원` : ''
        ].filter(line => line).join('\n')

        console.log('Generating Bank Transfer QR:', transferData, options)
        await QRCode.toCanvas(canvas, transferData, getOptions(options))
        console.log('Bank Transfer QR generated successfully')
    } catch (err) {
        console.error('Bank Transfer QR generation error:', err)
        throw err
    }
}

// 메뉴 QR 코드 생성
export const generateMenuQR = async (menuData, canvas, options = {}) => {
    try {
        const { restaurantName, items } = menuData
        if (!restaurantName) throw new Error('가게 이름을 입력해주세요')
        if (!items || items.length === 0) throw new Error('메뉴 항목을 추가해주세요')

        const menuText = [
            `📋 ${restaurantName}`,
            '',
            ...items.map(item => `${item.name} - ${item.price}원${item.description ? '\n  ' + item.description : ''}`)
        ].join('\n')

        console.log('Generating Menu QR:', menuText, options)
        await QRCode.toCanvas(canvas, menuText, getOptions(options))
        console.log('Menu QR generated successfully')
    } catch (err) {
        console.error('Menu QR generation error:', err)
        throw err
    }
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
