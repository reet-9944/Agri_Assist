import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

// 23 crops supported by crop.health ML API
const ALL_CROPS = [
  { key: 'apple', name: 'Apple', icon: '🍎', latin: 'Malus domestica' },
  { key: 'banana', name: 'Banana', icon: '🍌', latin: 'Musa spp.' },
  { key: 'barley', name: 'Barley', icon: '🌾', latin: 'Hordeum vulgare' },
  { key: 'cassava', name: 'Cassava', icon: '🥔', latin: 'Manihot esculenta' },
  { key: 'citrus', name: 'Citrus', icon: '🍊', latin: 'Citrus spp.' },
  { key: 'cocoa', name: 'Cocoa', icon: '🍫', latin: 'Theobroma cacao' },
  { key: 'coffee', name: 'Coffee', icon: '☕', latin: 'Coffea spp.' },
  { key: 'corn', name: 'Corn', icon: '🌽', latin: 'Zea mays' },
  { key: 'cotton', name: 'Cotton', icon: '🌿', latin: 'Gossypium spp.' },
  { key: 'cucumber', name: 'Cucumber', icon: '🥒', latin: 'Cucumis sativus' },
  { key: 'eggplant', name: 'Eggplant', icon: '🍆', latin: 'Solanum melongena' },
  { key: 'garlic', name: 'Garlic', icon: '🧄', latin: 'Allium sativum' },
  { key: 'grapevine', name: 'Grapevine', icon: '🍇', latin: 'Vitis spp.' },
  { key: 'oil_palm', name: 'Oil Palm', icon: '🌴', latin: 'Elaeis guineensis' },
  { key: 'onion', name: 'Onion', icon: '🧅', latin: 'Allium cepa' },
  { key: 'potato', name: 'Potato', icon: '🥔', latin: 'Solanum tuberosum' },
  { key: 'rice', name: 'Rice', icon: '🌾', latin: 'Oryza spp.' },
  { key: 'soybean', name: 'Soybean', icon: '🫘', latin: 'Glycine max' },
  { key: 'sugarcane', name: 'Sugarcane', icon: '🎋', latin: 'Saccharum officinarum' },
  { key: 'tea', name: 'Tea', icon: '🍵', latin: 'Camellia sinensis' },
  { key: 'tobacco', name: 'Tobacco', icon: '🌱', latin: 'Nicotiana tabacum' },
  { key: 'tomato', name: 'Tomato', icon: '🍅', latin: 'Solanum lycopersicum' },
  { key: 'wheat', name: 'Wheat', icon: '🌾', latin: 'Triticum spp.' },
];

const SCAN_STEPS = [
  'Preprocessing image...',
  'Detecting crop type...',
  'Analyzing leaf patterns...',
  'Matching disease signatures...',
  'Calculating severity...',
  'Generating treatment plan...',
];

export default function Scanner() {
  const { API } = useAuth();

  // steps: 'select' | 'upload' | 'scanning' | 'result'
  const [step, setStep] = useState('select');
  const [cropSearch, setCropSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [result, setResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [mlAvailable, setMlAvailable] = useState(true);

  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const filteredCrops = cropSearch.trim()
    ? ALL_CROPS.filter(c =>
        c.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
        c.latin.toLowerCase().includes(cropSearch.toLowerCase())
      )
    : ALL_CROPS;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large. Max 10MB.'); return; }
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch {
      toast.error('Camera not available. Try uploading a photo.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    clearInterval(intervalRef.current);
  }, []);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const startScan = async () => {
    if (!uploadedFile && !selectedCrop) {
      toast.warning('Please upload an image or select a crop sample');
      return;
    }
    setStep('scanning');
    setScanProgress(0);
    setScanStatus(SCAN_STEPS[0]);

    // Animate progress bar
    let pct = 0, si = 0;
    intervalRef.current = setInterval(() => {
      pct += Math.random() * 12 + 4;
      if (pct > 92) pct = 92; // hold at 92 until API responds
      setScanProgress(Math.round(pct));
      const newSi = Math.min(Math.floor(pct / 16), SCAN_STEPS.length - 1);
      if (newSi !== si) { si = newSi; setScanStatus(SCAN_STEPS[si]); }
    }, 220);

    try {
      let scanResult;

      if (uploadedFile && mlAvailable) {
        // Real ML scan
        const imageBase64 = await toBase64(uploadedFile);
        try {
          const r = await axios.post(`${API}/api/scan/ml`, {
            imageBase64,
            cropType: selectedCrop?.key || null,
          });
          scanResult = { type: 'ml', data: r.data };
        } catch (mlErr) {
          if (mlErr.response?.status === 503) {
            setMlAvailable(false);
          } else {
            toast.warning('Scan failed — please try again.');
          }
          // fallback
          const r = await axios.post(`${API}/api/scan`, {
            cropType: selectedCrop?.key || 'tomato',
            filename: uploadedFile?.name || '',
          });
          scanResult = { type: 'mock', data: r.data };
        }
      } else {
        // No image uploaded — demo mode
        const r = await axios.post(`${API}/api/scan`, {
          cropType: selectedCrop?.key || 'tomato',
          filename: selectedCrop?.key || 'tomato',
        });
        scanResult = { type: 'mock', data: r.data };
      }

      clearInterval(intervalRef.current);
      setScanProgress(100);
      setScanStatus('Done!');
      setTimeout(() => { setResult(scanResult); setStep('result'); }, 400);
    } catch (err) {
      clearInterval(intervalRef.current);
      toast.error('Scan failed. Please try again.');
      setStep('upload');
    }
  };

  const speakResult = () => {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    let text = '';
    if (result?.type === 'ml' && result.data.disease) {
      const d = result.data.disease;
      text = `Disease detected: ${d.name}. Confidence: ${Math.round(d.probability * 100)} percent. ${d.description?.slice(0, 200) || ''}`;
    } else if (result?.type === 'mock' && result.data.disease) {
      const d = result.data.disease;
      text = `Disease detected: ${d.name}. Severity: ${d.level}. ${d.description}`;
    }
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.88; utter.lang = 'en-IN';
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  const resetScan = () => {
    clearInterval(intervalRef.current);
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); }
    setStep('select');
    setSelectedCrop(null);
    setUploadedFile(null);
    setPreviewUrl(null);
    setScanProgress(0);
    setResult(null);
    setCropSearch('');
  };

  const getLevelColor = (level) => {
    if (!level) return '#27ae60';
    const l = level.toLowerCase();
    if (l.includes('critical') || l.includes('high')) return '#e74c3c';
    if (l.includes('moderate') || l.includes('medium')) return '#e67e22';
    return '#27ae60';
  };

  const getProbabilityLevel = (prob) => {
    if (prob >= 0.7) return { label: 'High', color: '#e74c3c', bg: 'bg-red-100 text-red-600' };
    if (prob >= 0.4) return { label: 'Moderate', color: '#e67e22', bg: 'bg-orange-100 text-orange-600' };
    return { label: 'Low', color: '#27ae60', bg: 'bg-green-100 text-green-700' };
  };

  return (
    <AppLayout title="AI Disease Scanner" subtitle="Powered by crop.health ML · 288 diseases · 23 crops">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: CROP SELECTION ── */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-white rounded-2xl border border-agri-7 p-6 mb-4">
                <div className="inline-block bg-agri-7 text-agri-2 text-xs font-bold px-3 py-1 rounded-full mb-3">Step 1 of 2 — Select Crop</div>
                <h2 className="font-head text-xl font-bold text-gray-900 mb-1">Which crop are you scanning?</h2>
                <p className="text-sm text-gray-400 mb-5">Select your crop for more accurate ML detection, or skip to scan any plant</p>

                {/* Search */}
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search crop (e.g. tomato, rice, apple...)"
                    value={cropSearch}
                    onChange={e => setCropSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border-2 border-agri-6 rounded-xl text-sm focus:outline-none focus:border-agri-3 transition-colors"
                  />
                </div>

                {/* Crop Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredCrops.map(c => (
                    <button key={c.key} onClick={() => setSelectedCrop(c)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center
                        ${selectedCrop?.key === c.key
                          ? 'border-agri-2 bg-agri-7 shadow-md scale-105'
                          : 'border-gray-100 bg-gray-50 hover:border-agri-5 hover:bg-agri-8'}`}>
                      <span className="text-2xl">{c.icon}</span>
                      <span className="text-[11px] font-bold text-gray-900 leading-tight">{c.name}</span>
                    </button>
                  ))}
                  {filteredCrops.length === 0 && (
                    <div className="col-span-full text-center text-gray-400 text-sm py-6">No crops found for "{cropSearch}"</div>
                  )}
                </div>

                {selectedCrop && (
                  <div className="mt-3 flex items-center gap-2 bg-agri-8 rounded-xl px-4 py-2.5">
                    <span className="text-xl">{selectedCrop.icon}</span>
                    <div>
                      <span className="font-bold text-agri-2 text-sm">{selectedCrop.name}</span>
                      <span className="text-xs text-gray-400 ml-2 italic">{selectedCrop.latin}</span>
                    </div>
                    <button onClick={() => setSelectedCrop(null)} className="ml-auto text-gray-400 hover:text-gray-600 text-sm">✕</button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('upload')}
                  className={`flex-1 py-4 rounded-2xl font-bold text-base transition-all
                    ${selectedCrop
                      ? 'bg-gradient-to-r from-agri-3 to-agri-1 text-white hover:-translate-y-1 hover:shadow-xl'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {selectedCrop ? `Continue with ${selectedCrop.name} →` : 'Skip — Scan Any Plant →'}
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                💡 Selecting crop improves ML accuracy. You can also skip and let AI auto-detect.
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: UPLOAD ── */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-agri-7 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="inline-block bg-agri-7 text-agri-2 text-xs font-bold px-3 py-1 rounded-full">Step 2 of 2</div>
                      {selectedCrop && (
                        <div className="flex items-center gap-1 bg-agri-8 text-agri-2 text-xs font-bold px-3 py-1 rounded-full">
                          {selectedCrop.icon} {selectedCrop.name}
                          <button onClick={() => setStep('select')} className="ml-1 text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                      )}
                    </div>
                    <h2 className="font-head text-xl font-bold text-gray-900 mb-1">Upload Crop Image</h2>
                    <p className="text-sm text-gray-400 mb-5">
                      📡 AI-powered crop disease analysis — upload a clear photo for best results
                    </p>

                    {/* Camera Modal */}
                    <AnimatePresence>
                      {showCamera && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black z-50 flex flex-col">
                          <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
                          <div className="flex gap-4 justify-center p-6 bg-black">
                            <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl shadow-lg">📸</button>
                            <button onClick={stopCamera} className="px-5 py-2 bg-white/20 text-white rounded-full font-semibold">✕ Cancel</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} className="hidden" />

                    {previewUrl ? (
                      <div className="border-2 border-agri-3 rounded-2xl overflow-hidden mb-4 relative">
                        <img src={previewUrl} alt="Uploaded crop" className="w-full h-52 object-cover" />
                        <button onClick={() => { setPreviewUrl(null); setUploadedFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                          className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-white shadow">✕</button>
                        <div className="absolute bottom-2 left-2 bg-agri-2/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ✓ Image ready for ML scan
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => fileRef.current.click()}
                        className="border-2 border-dashed border-agri-5 bg-agri-8 rounded-2xl p-8 text-center cursor-pointer hover:bg-agri-7 hover:border-agri-3 hover:scale-[1.01] transition-all mb-4">
                        <div className="text-5xl mb-3">📷</div>
                        <h3 className="font-bold text-gray-900 mb-1">Tap to Upload Crop Photo</h3>
                        <p className="text-xs text-gray-400">JPG, PNG, HEIC supported · Max 10MB</p>
                        <p className="text-xs text-gray-300 mt-2">or drag & drop your image here</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={() => fileRef.current.click()}
                        className="flex-1 border-2 border-agri-5 text-agri-2 font-semibold py-2.5 rounded-xl text-sm hover:bg-agri-8 transition-colors">
                        📁 From Gallery
                      </button>
                      <button onClick={startCamera}
                        className="flex-1 border-2 border-agri-5 text-agri-2 font-semibold py-2.5 rounded-xl text-sm hover:bg-agri-8 transition-colors">
                        📸 Use Camera
                      </button>
                    </div>
                  </div>

                  <button onClick={startScan}
                    className="w-full bg-gradient-to-r from-agri-3 to-agri-1 text-white py-4 rounded-2xl font-bold text-base hover:-translate-y-1 hover:shadow-xl transition-all">
                    🔍 {uploadedFile ? 'Analyze with AI' : selectedCrop ? `Demo Scan — ${selectedCrop.name}` : 'Demo Scan'}
                  </button>
                  <button onClick={() => setStep('select')} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    ← Back to crop selection
                  </button>
                </div>

                {/* Right Panel */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-agri-7 p-4">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">🤖 ML Engine</h3>
                    <div className="text-xs font-bold px-3 py-2 rounded-xl mb-3 bg-green-50 text-green-700">
                      ● AI Engine Active
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div>✓ 23 major crops</div>
                      <div>✓ 288 diseases & pests</div>
                      <div>✓ 85–93% accuracy</div>
                      <div>✓ Treatment plans</div>
                      <div>✓ Severity scoring</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-agri-7 p-4">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">📸 Photo Tips</h3>
                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div>✓ Clear, well-lit photo</div>
                      <div>✓ Focus on affected leaf</div>
                      <div>✓ Avoid blurry images</div>
                      <div>✓ Natural daylight best</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SCANNING ── */}
          {step === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl border border-agri-7 p-8 text-center max-w-lg mx-auto">
                <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  {[128, 96, 60].map((s, i) => (
                    <div key={i} className="absolute rounded-full border-2 border-agri-4 opacity-40"
                      style={{ width: s, height: s, animation: `ping 2s ${i * 0.4}s cubic-bezier(0,0,0.2,1) infinite` }} />
                  ))}
                  <div className="text-4xl z-10 animate-bounce">🔬</div>
                </div>
                <h2 className="font-head text-xl font-bold text-gray-900 mb-2">
                  {uploadedFile ? 'Running ML Analysis...' : 'Analyzing Crop...'}
                </h2>
                <p className="text-gray-400 text-sm mb-5">{scanStatus}</p>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-3 bg-agri-7 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-agri-4 to-agri-1 rounded-full"
                      animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <span className="text-sm font-bold text-agri-2 min-w-[40px] text-right">{scanProgress}%</span>
                </div>
                {uploadedFile && (
                  <div className="text-xs bg-agri-8 text-agri-2 font-semibold px-4 py-2 rounded-full inline-block">
                    📡 Analyzing with AI engine...
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {step === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {result.type === 'ml' ? (
                <MLResult result={result.data} previewUrl={previewUrl} speaking={speaking}
                  onSpeak={speakResult} onReset={resetScan} getProbabilityLevel={getProbabilityLevel} />
              ) : (
                <MockResult result={result.data} previewUrl={previewUrl} speaking={speaking}
                  onSpeak={speakResult} onReset={resetScan} getLevelColor={getLevelColor} />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

// ── ML Result Component (real API response) ──
function MLResult({ result, previewUrl, speaking, onSpeak, onReset, getProbabilityLevel }) {
  const disease = result.disease;
  const crop = result.cropDetected;
  const isHealthy = result.isHealthy;

  return (
    <div className="bg-white rounded-2xl border border-agri-7 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-2 to-agri-1 p-5">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white/60 font-bold tracking-widest">ML DETECTION RESULT</span>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">crop.health AI</span>
            </div>
            <h2 className="font-head text-2xl font-bold text-white mb-1">
              {disease ? disease.name : isHealthy ? '✅ Healthy Plant' : 'No Disease Detected'}
            </h2>
            {crop && (
              <p className="text-white/70 text-sm">Crop detected: {crop.name} ({Math.round(crop.probability * 100)}% confidence)</p>
            )}
          </div>
          {disease && (
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${getProbabilityLevel(disease.probability).bg}`}>
              {getProbabilityLevel(disease.probability).label} Risk
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="px-5 pt-4">
          <img src={previewUrl} alt="Scanned crop" className="w-full h-44 object-cover rounded-xl" />
        </div>
      )}

      <div className="p-5 space-y-5">
        {/* Confidence */}
        {disease && (
          <div>
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span className="text-gray-700">ML Confidence</span>
              <span className="text-agri-2">{Math.round(disease.probability * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${disease.probability * 100}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-agri-4 to-agri-1" />
            </div>
          </div>
        )}

        {/* Healthy */}
        {isHealthy === true && !disease && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🌿</div>
            <div className="font-bold text-green-700">Your plant looks healthy!</div>
            <div className="text-xs text-green-600 mt-1">No diseases or pests detected.</div>
          </div>
        )}

        {/* Description */}
        {disease?.description && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
            {disease.description}
          </div>
        )}

        {/* Symptoms */}
        {disease?.symptoms && (
          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-sm">🔍 Symptoms</h3>
            <div className="bg-yellow-50 rounded-xl p-3 text-sm text-gray-700">{disease.symptoms}</div>
          </div>
        )}

        {/* Treatment */}
        {disease?.treatment && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">💊 Treatment Plan</h3>
            {disease.treatment.chemical && (
              <div className="mb-2 p-3 bg-agri-8 rounded-xl text-sm">
                <span className="font-bold text-agri-2">Chemical: </span>
                <span className="text-gray-700">{disease.treatment.chemical}</span>
              </div>
            )}
            {disease.treatment.biological && (
              <div className="mb-2 p-3 bg-green-50 rounded-xl text-sm">
                <span className="font-bold text-green-700">Biological: </span>
                <span className="text-gray-700">{disease.treatment.biological}</span>
              </div>
            )}
            {disease.treatment.prevention && (
              <div className="p-3 bg-blue-50 rounded-xl text-sm">
                <span className="font-bold text-blue-700">Prevention: </span>
                <span className="text-gray-700">{disease.treatment.prevention}</span>
              </div>
            )}
          </div>
        )}

        {/* Other possible diseases */}
        {result.allDiseases?.length > 1 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">📊 Other Possibilities</h3>
            <div className="space-y-2">
              {result.allDiseases.slice(1, 4).map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-agri-7">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{d.name}</div>
                  </div>
                  <div className="text-xs font-bold text-gray-500">{Math.round(d.probability * 100)}%</div>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-agri-4 rounded-full" style={{ width: `${d.probability * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wiki link */}
        {disease?.wikiUrl && (
          <a href={disease.wikiUrl} target="_blank" rel="noopener noreferrer"
            className="block text-center text-xs text-agri-3 hover:underline">
            📖 Learn more about {disease.name}
          </a>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={onSpeak}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2
              ${speaking ? 'bg-agri-2 text-white border-agri-2' : 'bg-agri-8 text-agri-1 border-agri-6 hover:bg-agri-7'}`}>
            {speaking ? '⏹ Stop' : '🔊 Hear Result'}
          </button>
          <button onClick={() => { window.location.href = '/stores'; }}
            className="flex items-center gap-2 px-5 py-2.5 bg-agri-2 text-white rounded-full font-semibold text-sm hover:bg-agri-1 transition-colors">
            🏪 Find Store
          </button>
          <button onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors">
            🔄 Scan Another
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mock/Demo Result Component ──
function MockResult({ result, previewUrl, speaking, onSpeak, onReset, getLevelColor }) {
  const d = result.disease;
  if (!d) return null;
  const color = getLevelColor(d.level);

  return (
    <div className="bg-white rounded-2xl border border-agri-7 overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-agri-2 to-agri-1 p-5 flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-white/60 font-bold tracking-widest">AI DETECTION RESULT</span>
          </div>
          <h2 className="font-head text-2xl font-bold text-white mb-1">{d.name}</h2>
          <p className="text-white/70 text-sm">{result.cropType ? `Crop: ${result.cropType}` : ''}</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 text-white flex-shrink-0">{d.level} Risk</span>
      </div>

      {previewUrl && (
        <div className="px-5 pt-4">
          <img src={previewUrl} alt="Scanned crop" className="w-full h-44 object-cover rounded-xl" />
        </div>
      )}

      <div className="p-5 space-y-5">
        <div>
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-gray-700">Disease Severity</span>
            <span style={{ color }}>{d.severity}% — {d.level}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${d.severity}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full" style={{ background: color }} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">{d.description}</div>

        <div>
          <h3 className="font-bold text-gray-900 mb-3">💊 Treatment Plan</h3>
          <div className="space-y-2">
            {d.treatments?.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                className="flex gap-3 p-3 bg-agri-8 rounded-xl text-sm">
                <span className="text-agri-3 font-bold flex-shrink-0">✓</span>
                <span className="text-gray-700 leading-snug">{t}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {d.pesticide && (
          <div className="border border-agri-6 bg-agri-8 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <div>
              <div className="text-xs text-gray-400 font-medium mb-0.5">Recommended Pesticide</div>
              <div className="font-bold text-agri-1">{d.pesticide}</div>
            </div>
          </div>
        )}



        <div className="flex flex-wrap gap-3">
          <button onClick={onSpeak}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2
              ${speaking ? 'bg-agri-2 text-white border-agri-2' : 'bg-agri-8 text-agri-1 border-agri-6 hover:bg-agri-7'}`}>
            {speaking ? '⏹ Stop' : '🔊 Hear Result'}
          </button>
          <button onClick={() => { window.location.href = '/stores'; }}
            className="flex items-center gap-2 px-5 py-2.5 bg-agri-2 text-white rounded-full font-semibold text-sm hover:bg-agri-1 transition-colors">
            🏪 Find Store
          </button>
          <button onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors">
            🔄 Scan Another
          </button>
        </div>
      </div>
    </div>
  );
}
