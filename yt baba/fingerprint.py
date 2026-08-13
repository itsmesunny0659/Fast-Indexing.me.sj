import os
import sys
import hashlib
import numpy as np

def generate_audio_fingerprint(samples, sample_rate=22050):
    """
    Generates a mock audio spectrogram fingerprint using a windowed FFT approximation.
    """
    # Create mock spectrogram peaks
    n = len(samples)
    if n == 0:
        return []
    
    # Calculate a simplified FFT energy representation
    spectrogram = []
    window_size = 1024
    hop_size = 512
    
    for i in range(0, n - window_size, hop_size):
        window = samples[i:i+window_size]
        # Perform real FFT
        fft_result = np.abs(np.fft.rfft(window))
        # Find local peaks (frequency bins with highest energy)
        peak_bin = np.argmax(fft_result)
        peak_energy = fft_result[peak_bin]
        spectrogram.append((i // hop_size, peak_bin, peak_energy))
        
    # Generate combinatorial hashes
    hashes = []
    for idx in range(len(spectrogram) - 1):
        time1, freq1, _ = spectrogram[idx]
        time2, freq2, _ = spectrogram[idx+1]
        time_diff = time2 - time1
        # Pack frequency pair and time difference into a unique string and hash it
        hash_string = f"{freq1}|{freq2}|{time_diff}"
        h = hashlib.sha256(hash_string.encode('utf-8')).hexdigest()[:16]
        hashes.append(h)
        
    return hashes

def generate_video_phash(frame_data_2d):
    """
    Generates a 64-bit Perceptual Hash (pHash) using a simplified 2D DCT calculation.
    Expects a 2D numpy array of size 32x32 (grayscale image).
    """
    if frame_data_2d.shape != (32, 32):
        raise ValueError("Frame data must be a 32x32 grayscale matrix")
        
    # Calculate Discrete Cosine Transform (DCT)
    # Using a simple DCT approximation or standard SciPy/numpy representation
    # For standalone portability, we do a basic 2D DCT row-column transformation
    dct_rows = np.zeros((32, 32))
    for i in range(32):
        # 1D DCT on rows
        dct_rows[i, :] = np.fft.dct(frame_data_2d[i, :]) if hasattr(np.fft, 'dct') else np.real(np.fft.rfft(frame_data_2d[i, :], n=32))[:32]
        
    dct_cols = np.zeros((32, 32))
    for j in range(32):
        # 1D DCT on columns
        dct_cols[:, j] = np.fft.dct(dct_rows[:, j]) if hasattr(np.fft, 'dct') else np.real(np.fft.rfft(dct_rows[:, j], n=32))[:32]
        
    # Extract top-left 8x8 low-frequency coefficients (excluding DC component at 0,0)
    low_freq = dct_cols[1:9, 1:9]
    avg = np.mean(low_freq)
    
    # Calculate binary perceptual hash based on average threshold
    phash_bits = (low_freq > avg).astype(int)
    phash_hex = "".join([str(bit) for bit in phash_bits.flatten()])
    
    # Convert binary string to 16-character hex representation
    return f"{int(phash_hex, 2):016x}"

if __name__ == "__main__":
    print("[YTBaba-Engine] Initializing Feature Extraction Engine...")
    
    # Generate test mock audio data (sine wave with noise)
    t = np.linspace(0, 1, 44100)
    mock_audio = np.sin(2 * np.pi * 440 * t) + np.random.normal(0, 0.1, 44100)
    
    audio_hashes = generate_audio_fingerprint(mock_audio)
    print(f"Generated {len(audio_hashes)} audio hashes. First 5: {audio_hashes[:5]}")
    
    # Generate test mock video frame (32x32 matrix)
    mock_frame = np.random.randint(0, 255, size=(32, 32), dtype=np.uint8)
    frame_hash = generate_video_phash(mock_frame)
    print(f"Generated Video pHash: {frame_hash}")
