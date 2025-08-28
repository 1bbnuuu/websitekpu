let formData = [];
let uploadedFiles = [];
let cameraStream = null;

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuCEgMOaYENh5iNrxqCvBp9brxVHe16CoknraWUULpmXciQ0NprSOA51ATwVXAqksO/exec';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('tanggal').valueAsDate = new Date();
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Camera API not supported');
    }
});

function handleFileUpload(input) {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg'
    ];

    const files = Array.from(input.files);
    
    files.forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            showMessage(`Jenis file ${file.name} tidak diperbolehkan. Hanya PDF, DOCX, PNG, dan JPG/JPEG.`, 'warning');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage("File ${file.name} terlalu besar. Maksimal 5MB per file.", 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileObj = {
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                source: 'file'
            };
            
            uploadedFiles.push(fileObj);
            displayFilePreview();
        };
        reader.readAsDataURL(file);
    });
}

async function openCamera() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraStream');
    
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'environment'
            } 
        });
        
        video.srcObject = cameraStream;
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        showMessage('Tidak dapat mengakses kamera. Pastikan browser mendukung dan memberikan izin kamera.', 'warning');
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `foto_${timestamp}.jpg`;
    
    const fileObj = {
        name: fileName,
        size: dataURL.length * 0.75,
        type: 'image/jpeg',
        data: dataURL,
        source: 'camera'
    };
    
    uploadedFiles.push(fileObj);
    displayFilePreview();
    closeCamera();
    
    showMessage('Foto berhasil diambil dan ditambahkan!', 'success');
}

function closeCamera() {
    const modal = document.getElementById('cameraModal');
    
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    modal.classList.add('hidden');
}

function displayFilePreview() {
    const preview = document.getElementById('filePreview');
    preview.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'relative bg-gray-50 rounded-lg overflow-hidden border';
        
        let content = '';
        let sourceIcon = file.source === 'camera' ? '📸' : '📄';
        
        if (file.type.startsWith('image/')) {
            content = `<img src="${file.data}" class="w-full h-24 object-cover" alt="${file.name}">`;
        } else {
            content = `<div class="w-full h-24 flex items-center justify-center bg-gray-100">
                <div class="text-center">
                    <div class="text-2xl mb-1">${sourceIcon}</div>
                    <div class="text-xs text-gray-600 truncate">${file.name}</div>
                </div>
            </div>`;
        }
        
        item.innerHTML = `
            ${content}
            <div class="p-2">
                <div class="flex items-center gap-1 mb-1">
                    <span class="text-xs">${sourceIcon}</span>
                    <div class="text-xs font-medium text-gray-900 truncate flex-1">${file.name}</div>
                </div>
                <div class="text-xs text-gray-500">${(file.size/1024).toFixed(1)} KB</div>
            </div>
            <button type="button" onclick="removeFile(${index})" 
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
        `;
        
        preview.appendChild(item);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayFilePreview();
}

document.getElementById('infoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
    
    const now = new Date();
    const submitDate = now.toLocaleDateString('id-ID');
    const submitTime = now.toLocaleTimeString('id-ID');
    
    const data = {
        id: Date.now(),
        nama: document.getElementById('nama').value,
        tanggal: document.getElementById('tanggal').value,
        alamat: document.getElementById('alamat').value,
        kontak: document.getElementById('kontak').value,
        pekerjaan: document.getElementById('pekerjaan').value,
        pihakTujuan: document.getElementById('pihakTujuan').value === 'Lainnya'
            ? document.getElementById('pihakTujuanLainnya').value
            : document.getElementById('pihakTujuan').value,

        informasi: document.getElementById('informasi').value,
        files: [...uploadedFiles],
        tanggalSubmit: `${submitDate} ${submitTime}`
    };
    
    formData.push(data);
    
    try {
        if (GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL !== 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            showMessage('Formulir berhasil dikirim! Terima kasih atas permohonan informasi Anda.', 'success');
        } else {
            showMessage('Formulir berhasil disubmit. Untuk mengirim ke Google Sheets, harap setup Apps Script URL terlebih dahulu.', 'warning');
        }
    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        showMessage('Terjadi kesalahan saat mengirim formulir. Silakan coba lagi atau hubungi administrator.', 'warning');
    }
    
    document.getElementById('infoForm').reset();
    uploadedFiles = [];
    document.getElementById('filePreview').innerHTML = '';
    document.getElementById('tanggal').valueAsDate = new Date();
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Kirim Formulir';
});

function showMessage(text, type = 'success') {
    const messageEl = type === 'success' ? document.getElementById('successMessage') : document.getElementById('warningMessage');
    const otherMessageEl = type === 'success' ? document.getElementById('warningMessage') : document.getElementById('successMessage');
    
    otherMessageEl.classList.add('hidden');
    
    messageEl.querySelector('p').textContent = text;
    messageEl.classList.remove('hidden');
    messageEl.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 8000);
}

function clearAllData() {
    if (confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
        formData = [];
        showMessage('Semua data telah dihapus.', 'success');
    }
}

function exportToCSV() {
    if (formData.length === 0) {
        showMessage('Tidak ada data untuk diekspor.', 'warning');
        return;
    }
    
    const headers = ['No', 'Nama', 'Tanggal', 'Alamat', 'Kontak', 'Pekerjaan/Institusi', 'Pihak Dituju', 'Informasi', 'Jumlah Files', 'Tanggal Submit'];
    const csvContent = [headers.join(',')];
    
    formData.forEach((data, index) => {
        const row = [
            index + 1,
            `"${data.nama}"`,
            `"${new Date(data.tanggal).toLocaleDateString('id-ID')}"`,
            `"${data.alamat.replace(/"/g, '""')}"`,
            `"${data.kontak}"`,
            `"${data.pekerjaan}"`,
            `"${data.pihakTujuan}"`,
            `"${data.informasi.replace(/"/g, '""')}"`,
            data.files ? data.files.length : 0,
            `"${data.tanggalSubmit}"`
        ];
        csvContent.push(row.join(','));
    });
    
    downloadFile(csvContent.join('\n'), 'data_formulir.csv', 'text/csv');
}

function exportToExcel() {
    if (formData.length === 0) {
        showMessage('Tidak ada data untuk diekspor.', 'warning');
        return;
    }
    
    let excelContent = `
        <table border="1">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Tanggal</th>
                    <th>Alamat</th>
                    <th>Kontak</th>
                    <th>Pekerjaan/Institusi</th>
                    <th>Pihak Dituju</th>
                    <th>Informasi</th>
                    <th>Jumlah Files</th>
                    <th>Tanggal Submit</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    formData.forEach((data, index) => {
        excelContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${data.nama}</td>
                <td>${new Date(data.tanggal).toLocaleDateString('id-ID')}</td>
                <td>${data.alamat}</td>
                <td>${data.kontak}</td>
                <td>${data.pekerjaan}</td>
                <td>${data.pihakTujuan}</td>
                <td>${data.informasi}</td>
                <td>${data.files ? data.files.length : 0}</td>
                <td>${data.tanggalSubmit}</td>
            </tr>
        `;
    });
    
    excelContent += '</tbody></table>';
    downloadFile(excelContent, 'data_formulir.xls', 'application/vnd.ms-excel');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

document.getElementById('cameraModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCamera();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !document.getElementById('cameraModal').classList.contains('hidden')) {
        closeCamera();
    }
});