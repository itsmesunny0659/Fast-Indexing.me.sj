import os
import sys
import subprocess
import numpy as np

def apply_adversarial_perturbation(data, epsilon=0.01):
    """
    Simulates Fast Gradient Sign Method (FGSM) adversarial perturbation on a signal.
    In a real scenario, this computes: sign(grad_x(Loss)).
    We simulate this by generating sign perturbations bounded by epsilon.
    """
    print(f"[YTBaba-Alteration] Applying adversarial perturbation with epsilon={epsilon}")
    # Simulating the sign of a mock gradient (pseudo-gradients matching signal trend)
    mock_gradient = np.gradient(data)
    perturbation = epsilon * np.sign(mock_gradient)
    return data + perturbation

def apply_psychoacoustic_masking(audio_samples, sample_rate=22050):
    """
    Simulates spectral/temporal psychoacoustic masking.
    We identify dominant frequencies and suppress neighboring frequencies within
    the critical band that are below the masking threshold, or inject shaped noise.
    """
    print("[YTBaba-Alteration] Applying psychoacoustic audio masking simulation...")
    # Perform FFT to identify spectral components
    n = len(audio_samples)
    if n == 0:
        return audio_samples
        
    freqs = np.fft.rfft(audio_samples)
    freq_bins = np.fft.rfftfreq(n, d=1/sample_rate)
    magnitude = np.abs(freqs)
    
    # Simple simulated spectral masking: 
    # For any frequency bin with high energy, raise the masking threshold for nearby bins
    threshold = np.ones_like(magnitude) * (np.max(magnitude) * 0.05) # base threshold
    
    # Find local spectral peaks
    peaks = []
    for i in range(1, len(magnitude) - 1):
        if magnitude[i] > magnitude[i-1] and magnitude[i] > magnitude[i+1] and magnitude[i] > threshold[i] * 2:
            peaks.append(i)
            
    # Raise threshold around peaks (simulating critical bands / simultaneous masking)
    for peak in peaks[:10]: # limit to top 10 dominant maskers for simulation
        center_freq = freq_bins[peak]
        # Critical bandwidth approximation: ~100 Hz below 500 Hz, 20% of center freq above 500 Hz
        bw = max(100.0, center_freq * 0.2)
        for i in range(len(freq_bins)):
            dist = abs(freq_bins[i] - center_freq)
            if dist < bw:
                # Masking effect decays with distance from center frequency
                decay = 1.0 - (dist / bw)
                masking_effect = magnitude[peak] * 0.25 * decay
                threshold[i] = max(threshold[i], masking_effect)
                
    # Zero out/attenuate frequencies that fall below the psychoacoustic masking threshold
    masked_freqs = freqs.copy()
    masked_freqs[magnitude < threshold] *= 0.1 # Attenuate masked components
    
    # Return reconstructed time domain signal
    return np.fft.irfft(masked_freqs, n=n)

def apply_dtw_alignment(seq1, seq2):
    """
    Computes the Dynamic Time Warping (DTW) distance between two sequences.
    """
    n, m = len(seq1), len(seq2)
    dtw_matrix = np.zeros((n + 1, m + 1))
    dtw_matrix[1:, 0] = np.inf
    dtw_matrix[0, 1:] = np.inf
    
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = abs(seq1[i-1] - seq2[j-1]) if isinstance(seq1[0], (int, float, np.number)) else (0 if seq1[i-1] == seq2[j-1] else 1)
            dtw_matrix[i, j] = cost + min(dtw_matrix[i-1, j],    # insertion
                                          dtw_matrix[i, j-1],    # deletion
                                          dtw_matrix[i-1, j-1])  # match/mismatch
                                          
    return dtw_matrix[n, m]

def apply_frame_manipulation(frames, mode="interpolate"):
    """
    Performs frame interpolation (blending adjacent frames) or decimation (skipping frames).
    """
    if len(frames) < 2:
        return frames
        
    if mode == "decimate":
        print("[YTBaba-Alteration] Decimating frames (dropping every 2nd frame)...")
        return frames[::2]
        
    elif mode == "interpolate":
        print("[YTBaba-Alteration] Interpolating frames (temporal frame blending)...")
        interpolated = []
        for i in range(len(frames) - 1):
            interpolated.append(frames[i])
            # Create a blended intermediate frame
            blended = (frames[i].astype(float) + frames[i+1].astype(float)) / 2
            interpolated.append(blended.astype(np.uint8))
        interpolated.append(frames[-1])
        return interpolated
        
    return frames

def apply_visual_spatial_alterations(frame, crop_factor=0.9):
    """
    Simulates visual spatial alterations (cropping and resizing).
    Crops the center of a 2D frame array and interpolates it back to original size (32x32).
    """
    h, w = frame.shape
    new_h, new_w = int(h * crop_factor), int(w * crop_factor)
    start_y, start_x = (h - new_h) // 2, (w - new_w) // 2
    
    cropped = frame[start_y:start_y+new_h, start_x:start_x+new_w]
    # Simple bilinear/nearest neighbor interpolation back to original shape
    y_indices = np.linspace(0, new_h - 1, h).astype(int)
    x_indices = np.linspace(0, new_w - 1, w).astype(int)
    return cropped[np.ix_(y_indices, x_indices)]

def apply_gamma_brightness(frame, gamma=1.2, brightness=10):
    """
    Applies gamma correction (contrast scaling) and brightness offsets to a frame.
    Formula: output = ((pixel / 255.0) ^ gamma) * 255.0 + brightness
    """
    normalized = frame / 255.0
    gamma_corrected = np.power(normalized, gamma) * 255.0
    brightened = gamma_corrected + brightness
    return np.clip(brightened, 0, 255).astype(np.uint8)

def apply_acoustic_noise(audio_samples, noise_level=0.01):
    """
    Simulates acoustic noise injection. Adds Gaussian white noise to the audio.
    """
    noise = np.random.normal(0, noise_level, len(audio_samples))
    return np.clip(audio_samples + noise, -1.0, 1.0)

def apply_keyframe_perturbation(frames, jitter_rate=0.2):
    """
    Simulates keyframe perturbation by dropping or duplicating keyframe samples.
    """
    perturbed = []
    for i in range(len(frames)):
        if np.random.random() < jitter_rate and i > 0:
            # Duplicate previous frame (simulate frame drop / keyframe freeze)
            perturbed.append(frames[i-1])
        else:
            perturbed.append(frames[i])
    return perturbed

def alter_video_for_testing(input_path, output_path):
    """
    Applies standard video/audio alterations (horizontal mirroring, 1% speed change,
    and slight pitch shifting) using FFmpeg to test copyright match threshold adjustments.
    """
    if not os.path.exists(input_path):
        print(f"[Error] Input video file not found: {input_path}")
        return False
        
    print(f"[YTBaba-Alteration] Processing media: {input_path}")
    
    # FFmpeg command filters:
    # - hflip: Flips the video horizontally (mirroring)
    # - atempo=1.01: Speeds up audio by 1% (changes tempo without shifting pitch too drastically)
    # - setpts=0.99*PTS: Speeds up video by 1% to match the audio tempo change
    cmd = [
        'ffmpeg',
        '-y',                  # Overwrite output file
        '-i', input_path,      # Input file
        '-vf', 'hflip,setpts=0.99*PTS',  # Video filters (flip & speed change)
        '-filter:a', 'atempo=1.01',      # Audio filters (tempo speed change)
        output_path            # Output file
    ]
    
    try:
        # Run FFmpeg command
        process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print(f"[YTBaba-Alteration] Successfully generated altered video: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print("[Error] FFmpeg execution failed. Ensure FFmpeg is installed and added to your system PATH.")
        print(e.stderr.decode('utf-8'))
        return False

if __name__ == "__main__":
    import json
    
    # CLI Mode or API Mode
    if len(sys.argv) > 1 and sys.argv[1] == "--api":
        # API call from Node.js
        # Redirect standard output to stderr for the duration of the run to keep stdout clean for JSON
        old_stdout = sys.stdout
        sys.stdout = sys.stderr
        
        # Perform all mock operations and return JSON
        audio_test = np.sin(np.linspace(0, 10, 100))
        perturbed = apply_adversarial_perturbation(audio_test, epsilon=0.02)
        masked = apply_psychoacoustic_masking(audio_test)
        noisy_audio = apply_acoustic_noise(audio_test, noise_level=0.01)
        
        s1 = [1, 2, 3, 4]
        s2 = [1, 1, 2, 3, 4]
        dtw_dist = apply_dtw_alignment(s1, s2)
        
        mock_frame = np.random.randint(0, 255, size=(32, 32), dtype=np.uint8)
        cropped_frame = apply_visual_spatial_alterations(mock_frame, crop_factor=0.8)
        gamma_frame = apply_gamma_brightness(mock_frame, gamma=1.3, brightness=15)
        
        mock_frames = [np.zeros((32, 32), dtype=np.uint8) for _ in range(6)]
        dec = apply_frame_manipulation(mock_frames, "decimate")
        interp = apply_frame_manipulation(mock_frames, "interpolate")
        jittered_frames = apply_keyframe_perturbation(mock_frames, jitter_rate=0.3)
        
        result = {
            "status": "success",
            "adversarial": {
                "original_max": float(np.max(audio_test)),
                "perturbed_max": float(np.max(perturbed)),
                "max_diff": float(np.max(np.abs(perturbed - audio_test)))
            },
            "psychoacoustic": {
                "original_length": len(audio_test),
                "masked_length": len(masked)
            },
            "acoustic_noise": {
                "original_max": float(np.max(audio_test)),
                "noisy_max": float(np.max(noisy_audio))
            },
            "dtw": {
                "sequence1": s1,
                "sequence2": s2,
                "distance": float(dtw_dist)
            },
            "visual_spatial": {
                "original_shape": list(mock_frame.shape),
                "cropped_shape": list(cropped_frame.shape)
            },
            "gamma_brightness": {
                "original_mean": float(np.mean(mock_frame)),
                "scaled_mean": float(np.mean(gamma_frame))
            },
            "frame_manipulation": {
                "original_frames": len(mock_frames),
                "decimated_frames": len(dec),
                "interpolated_frames": len(interp),
                "jittered_frames": len(jittered_frames)
            }
        }
        # Restore stdout to write JSON
        sys.stdout = old_stdout
        print(json.dumps(result))
    else:
        # Default self-run test
        print("[YTBaba-Alteration] Running self-test of signal processing algorithms...")
        audio_test = np.sin(np.linspace(0, 10, 100))
        perturbed = apply_adversarial_perturbation(audio_test, epsilon=0.05)
        print(f"  Perturbation absolute max diff: {np.max(np.abs(perturbed - audio_test)):.4f}")
        masked = apply_psychoacoustic_masking(audio_test)
        print(f"  Masked signal len: {len(masked)}")
        s1 = [1, 2, 3, 4]
        s2 = [1, 1, 2, 3, 4]
        dtw_dist = apply_dtw_alignment(s1, s2)
        print(f"  DTW alignment distance: {dtw_dist}")
        
        mock_frame = np.random.randint(0, 255, size=(32, 32), dtype=np.uint8)
        crop_f = apply_visual_spatial_alterations(mock_frame, crop_factor=0.8)
        print(f"  Cropping 32x32 to 0.8: resulting shape={crop_f.shape}")
        
        gamma_f = apply_gamma_brightness(mock_frame, gamma=1.3, brightness=15)
        print(f"  Gamma: orig_mean={np.mean(mock_frame):.2f}, scaled_mean={np.mean(gamma_f):.2f}")
        
        mock_frames = [np.zeros((32, 32), dtype=np.uint8) for _ in range(5)]
        dec = apply_frame_manipulation(mock_frames, "decimate")
        interp = apply_frame_manipulation(mock_frames, "interpolate")
        jit = apply_keyframe_perturbation(mock_frames, jitter_rate=0.3)
        print(f"  Frames: original={len(mock_frames)}, decimated={len(dec)}, interpolated={len(interp)}, jittered={len(jit)}")
        
        if len(sys.argv) >= 3:
            in_video = sys.argv[1]
            out_video = sys.argv[2]
            alter_video_for_testing(in_video, out_video)



