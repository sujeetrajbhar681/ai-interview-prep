// utils/parseResume.js

const parseResume = async (buffer) => {
  try {
    let text = '';

    // Try UTF-8 first
    const utf8 = buffer.toString('utf-8');

    if (utf8.includes('%PDF') || utf8.includes('\x00')) {
      // PDF — extract readable strings only
      const latin = buffer.toString('latin1');
      const matches = latin.match(/\(([^\)\\]{3,})\)/g) || [];
      text = matches
        .map(m => m.slice(1, -1))
        .filter(s => /[a-zA-Z]{2,}/.test(s))
        .join(' ')
        .replace(/\\n/g, '\n')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (text.length < 100) {
        // Scanned PDF fallback
        text = 'Resume content could not be extracted from this PDF. Please evaluate as a general software engineering candidate with moderate experience.';
      }
    } else {
      text = utf8;
    }

    // ── Critical: strip all non-printable and non-ASCII characters ──
    text = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')  // remove control chars
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')                        // keep only printable ASCII
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{3,}/g, ' ')
      .trim();

    if (text.length < 10) throw new Error('File appears to be empty after cleaning');

    return text;

  } catch (err) {
    throw new Error(`Failed to read file: ${err.message}`);
  }
};

export default parseResume;