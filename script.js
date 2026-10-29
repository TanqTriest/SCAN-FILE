// ================== TIỆN ÍCH ==================
const $ = (id) => document.getElementById(id);

function showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.add('hidden'), 2000);
}

// ================== THÀNH PHẦN GIAO DIỆN ==================
const resultText = $('result-text');
const fileUpload = $('file-upload');
const fileNameDisplay = $('file-name');
const loadingOcr = $('loading-ocr');
const loadingText = $('loading-text');

function updateCharCount() {
    $('char-count').textContent = `${resultText.value.length.toLocaleString('vi-VN')} ký tự`;
}
resultText.addEventListener('input', updateCharCount);

// ================== XÓA / SAO CHÉP ==================
$('clear-btn').addEventListener('click', () => {
    resultText.value = '';
    fileNameDisplay.textContent = 'Chưa chọn file nào';
    fileUpload.value = '';
    updateCharCount();
});

$('copy-btn').addEventListener('click', async () => {
    if (!resultText.value) return;
    try {
        await navigator.clipboard.writeText(resultText.value);
    } catch {
        resultText.select();
        document.execCommand('copy');
    }
    showToast('Đã sao chép văn bản');
});

// ================== PDF & ẢNH (OCR) ==================
const OCR_LANG = 'vie+eng';       // nhận diện cả tiếng Việt và tiếng Anh
const MIN_PDF_TEXT = 10;          // trang PDF có ít hơn số ký tự này => coi là trang scan
const PDF_RENDER_SCALE = 2;       // độ phân giải khi chuyển trang PDF thành ảnh để OCR

if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Quét một ảnh/canvas bằng worker Tesseract đã tạo sẵn
async function ocrImage(worker, source) {
    const { data: { text } } = await worker.recognize(source);
    return text.trim();
}

// Chuyển một trang PDF thành canvas để OCR
async function renderPageToCanvas(page) {
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    return canvas;
}

fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = file.name;
    loadingText.textContent = 'Đang xử lý file...';
    loadingOcr.classList.remove('hidden');

    let worker = null;
    // Tạo worker Tesseract (chỉ tạo khi cần) và hiển thị tiến độ theo `label`
    let progressLabel = 'Đang nhận diện ký tự';
    async function getWorker() {
        if (!worker) {
            loadingText.textContent = 'Đang tải bộ nhận diện ký tự (lần đầu có thể mất vài giây)...';
            worker = await Tesseract.createWorker(OCR_LANG, 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        loadingText.textContent = `${progressLabel}... ${Math.round(m.progress * 100)}%`;
                    }
                }
            });
        }
        return worker;
    }

    try {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const pages = [];
            let scannedPages = 0;

            for (let i = 1; i <= pdf.numPages; i++) {
                loadingText.textContent = `Đang đọc trang ${i}/${pdf.numPages}...`;
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                let pageText = textContent.items.map(item => item.str).join(' ').trim();

                // Trang không có lớp chữ (bản scan) => render thành ảnh rồi OCR
                if (pageText.length < MIN_PDF_TEXT) {
                    scannedPages++;
                    progressLabel = `Trang ${i}/${pdf.numPages} là bản scan, đang nhận diện ký tự`;
                    const w = await getWorker();
                    const canvas = await renderPageToCanvas(page);
                    pageText = await ocrImage(w, canvas);
                    canvas.width = canvas.height = 0; // giải phóng bộ nhớ
                }
                pages.push(pageText);
            }

            resultText.value = pages.join('\n\n').trim();
            if (!resultText.value) {
                alert('Không nhận diện được ký tự nào trong file PDF này.');
            } else if (scannedPages > 0) {
                showToast(`Đã quét OCR ${scannedPages}/${pdf.numPages} trang scan`);
            }
        } else if (file.type.startsWith('image/')) {
            progressLabel = 'Đang nhận diện ký tự';
            const w = await getWorker();
            resultText.value = await ocrImage(w, file);
            if (!resultText.value) {
                alert('Không nhận diện được ký tự nào trong ảnh này.');
            }
        } else {
            alert('Vui lòng tải lên file định dạng Ảnh hoặc PDF.');
        }
    } catch (err) {
        console.error('Scan error:', err);
        alert('Không thể đọc nội dung file này.');
    } finally {
        if (worker) { try { await worker.terminate(); } catch {} }
        loadingOcr.classList.add('hidden');
        fileUpload.value = ''; // cho phép chọn lại cùng một file
        updateCharCount();
    }
});
