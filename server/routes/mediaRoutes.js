const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov']);

function firstVideoInPublicSubdir(subdir) {
  const dir = path.join(__dirname, '..', '..', 'client', 'public', subdir);
  try {
    if (!fs.existsSync(dir)) return null;
    const names = fs.readdirSync(dir);
    const videos = names.filter((name) => {
      const full = path.join(dir, name);
      try {
        return fs.statSync(full).isFile() && VIDEO_EXT.has(path.extname(name).toLowerCase());
      } catch {
        return false;
      }
    });
    videos.sort();
    const first = videos[0];
    return first ? `/${subdir}/${first}`.replace(/\\/g, '/') : null;
  } catch {
    return null;
  }
}

/** Prefer public/assets/videos/, then public/videos/, then public/images/ */
function getFirstVideoUrl() {
  return (
    firstVideoInPublicSubdir('assets/videos') ||
    firstVideoInPublicSubdir('videos') ||
    firstVideoInPublicSubdir('images')
  );
}

router.get('/first-video', (req, res) => {
  const url = getFirstVideoUrl();
  res.json({ url });
});

module.exports = router;
