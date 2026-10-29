#!/usr/bin/env python3
"""Analyze decoded video frames: frame-diff state detection, contact sheets, keyframe crops.

Outputs:
  research/video-teardown/diff/{BV}.csv        per-frame diff score
  research/video-teardown/diff/{BV}-states.json  static spans + diff peaks
  research/video-teardown/sheets/{BV}-sheet-XX.jpg  one sheet per 36 sampled frames (every 12th source frame)
  research/video-teardown/keyframes/{BV}/       representative 1:1 frames (full width crops of UI)
"""
import json, os, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path('/home/huayu/Agent工作区/DSHarness/1/hortus-manus/research')
FRAMES = ROOT / 'videos' / 'frames'
OUT = ROOT / 'video-teardown'
DIFF = OUT / 'diff'; SHEETS = OUT / 'sheets'; KEYS = OUT / 'keyframes'; EVID = OUT / 'evidence'
for d in (DIFF, SHEETS, KEYS, EVID): d.mkdir(parents=True, exist_ok=True)
FFMPEG = os.path.expanduser('~/.local/bin/ffmpeg')

VIDEOS = {
    'BV1CDjz6bE6o': {'w': 1280, 'fps': 24, 'n': 1251},
    'BV1GKjm6aEfR': {'w': 1280, 'fps': 24, 'n': 958},
    'BV1WJjF67Eky': {'w': 1152, 'fps': 25, 'n': 884},
}


def diff_scores(bv):
    src = FRAMES / bv
    files = sorted(src.glob('*.jpg'))
    # decode all frames at tiny size straight from jpgs (fast path: PIL thumbnail on 160x90)
    prev = None
    rows = []
    for i, f in enumerate(files):
        im = Image.open(f).convert('L').resize((160, 90))
        a = np.asarray(im, dtype=np.int16)
        if prev is None:
            d = 0.0
        else:
            d = float(np.abs(a - prev).mean())
        rows.append((i + 1, float(a.mean()), d, f.name))
        prev = a
    with open(DIFF / f'{bv}.csv', 'w') as fh:
        fh.write('frame,luma,diff,file\n')
        for r in rows:
            fh.write(f'{r[0]},{r[1]:.2f},{r[2]:.2f},{r[3]}\n')
    d = np.array([r[2] for r in rows])
    return d, [r[3] for r in rows]


def states(bv, d, files, fps):
    thr = max(1.2, float(d.mean() + 2.0 * d.std()))
    peaks = []
    for i in range(1, len(d) - 1):
        if d[i] > thr and d[i] >= d[i - 1] and d[i] >= d[i + 1]:
            peaks.append({'frame': i + 1, 'time': round((i + 1) / fps, 2), 'diff': round(float(d[i]), 2)})
    # merge peaks closer than 6 frames
    merged = []
    for p in peaks:
        if merged and p['frame'] - merged[-1]['frame'] <= 6:
            if p['diff'] > merged[-1]['diff']:
                merged[-1] = p
        else:
            merged.append(p)
    # static spans: contiguous runs where diff < 1.0 for >= 2s
    static = []
    start = None
    quiet = max(0.35, float(np.percentile(d, 20)))
    for i in range(len(d)):
        if d[i] < quiet:
            if start is None:
                start = i
        else:
            if start is not None and (i - start) >= fps * 0.7:
                static.append({'startFrame': start + 1, 'endFrame': i, 'repFrame': (start + i) // 2 + 1,
                               'seconds': round((i - start) / fps, 1), 'quiet': round(quiet,2)})
            start = None
    if start is not None and (len(d) - start) >= fps * 0.7:
        static.append({'startFrame': start + 1, 'endFrame': len(d), 'repFrame': (start + len(d)) // 2,
                       'seconds': round((len(d) - start) / fps, 1)})
    return {'bv': bv, 'fps': fps, 'frames': len(d), 'threshold': round(thr, 2), 'meanDiff': round(float(d.mean()), 2),
            'diffPeaks': merged, 'staticSpans': static}


def sheets(bv, w):
    dst = SHEETS
    # every 12th frame, tile 6x6 (36 sampled frames per sheet) with index labels
    cmd = [FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-i', str(FRAMES / bv / '%05d.jpg'),
           '-vf', f"select='not(mod(n\\,12))',scale=320:-2,drawtext=text='%{{eif\\:n*12+1\\:d}}':x=6:y=6:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=6x6:padding=4",
           '-vsync', '0', '-q:v', '4', str(dst / f'{bv}-sheet-%02d.jpg')]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        # drawtext may be missing in some builds; retry without labels
        cmd2 = [c for c in cmd]
        vf = "select='not(mod(n\\,12))',scale=320:-2,tile=6x6:padding=4"
        idx = cmd2.index('-vf'); cmd2[idx + 1] = vf
        r = subprocess.run(cmd2, capture_output=True, text=True)
        print('sheet fallback', bv, r.returncode, r.stderr[-300:])
    return sorted(str(p) for p in dst.glob(f'{bv}-sheet-*.jpg'))


def keyframes(bv, st, files, w):
    kd = KEYS / bv; kd.mkdir(parents=True, exist_ok=True)
    picks = []
    for p in st['diffPeaks']:
        picks.append((p['frame'], f"peak-{p['frame']:05d}"))
    for s in st['staticSpans']:
        picks.append((s['repFrame'], f"state-{s['startFrame']:05d}-{s['endFrame']:05d}"))
    picks.sort()
    made = []
    for f, label in picks:
        f = min(max(f, 1), len(files))
        src = FRAMES / bv / files[f - 1]
        im = Image.open(src)
        out = kd / f"{label}.jpg"
        im.save(out, quality=92)
        made.append(str(out))
    return made


def ui_crops(bv, st, files, w):
    """Full-res crops of UI zones: top bar (capsule + color dots), bottom-left log, bottom-right hints, center stage."""
    cd = KEYS / bv / 'crops'; cd.mkdir(parents=True, exist_ok=True)
    reps = [s['repFrame'] for s in st['staticSpans']] + [p['frame'] for p in st['diffPeaks']]
    reps = sorted(set(reps))[:60]
    h = int(w * 9 / 16)
    zones = {
        'top': (0, 0, w, int(h * 0.16)),
        'bottom': (0, int(h * 0.80), w, h),
        'center': (int(w * 0.12), int(h * 0.16), int(w * 0.88), int(h * 0.80)),
    }
    made = []
    for f in reps:
        f = min(max(f, 1), len(files))
        im = Image.open(FRAMES / bv / files[f - 1])
        for zn, box in zones.items():
            c = im.crop(box)
            if zn == 'top' and c.width < 1280:
                c = c.resize((1280, int(c.height * 1280 / c.width)), Image.LANCZOS)
            out = cd / f'{f:05d}-{zn}.jpg'
            c.save(out, quality=90)
            made.append(str(out))
    return made


def main():
    summary = {}
    for bv, meta in VIDEOS.items():
        print('==', bv, flush=True)
        d, files = diff_scores(bv)
        st = states(bv, d, files, meta['fps'])
        (DIFF / f'{bv}-states.json').write_text(json.dumps(st, indent=2, ensure_ascii=False))
        sh = sheets(bv, meta['w'])
        kf = keyframes(bv, st, files, meta['w'])
        ui = ui_crops(bv, st, files, meta['w'])
        summary[bv] = {'frames': len(files), 'staticSpans': len(st['staticSpans']), 'diffPeaks': len(st['diffPeaks']),
                       'sheets': len(sh), 'keyframes': len(kf), 'uiCrops': len(ui)}
        print(json.dumps(summary[bv], ensure_ascii=False))
    (OUT / 'analysis-summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()