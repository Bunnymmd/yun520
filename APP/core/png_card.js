(function () {
  const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const encoder = typeof TextEncoder === 'function' ? new TextEncoder() : null;
  const decoder = typeof TextDecoder === 'function' ? new TextDecoder() : null;

  function encodeUtf8(text) {
    const value = String(text == null ? '' : text);
    if (encoder) return encoder.encode(value);
    const binary = unescape(encodeURIComponent(value));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function decodeUtf8(bytes) {
    if (decoder) return decoder.decode(bytes);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
    return decodeURIComponent(escape(binary));
  }

  function encodeAscii(text) {
    const source = String(text == null ? '' : text);
    const bytes = new Uint8Array(source.length);
    for (let index = 0; index < source.length; index += 1) bytes[index] = source.charCodeAt(index) & 0xff;
    return bytes;
  }

  function bytesToBase64(bytes) {
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      const chunk = bytes.subarray(index, Math.min(bytes.length, index + chunkSize));
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }

  function base64ToBytes(base64Value) {
    const binary = atob(String(base64Value || '').trim());
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function encodeJsonPayload(value) {
    return bytesToBase64(encodeUtf8(JSON.stringify(value)));
  }

  function decodeJsonPayload(value) {
    return JSON.parse(decodeUtf8(base64ToBytes(value)));
  }

  function tryParseEmbeddedPayload(text) {
    const source = String(text == null ? '' : text).trim();
    if (!source) return null;
    try {
      return JSON.parse(source);
    } catch (error) {}
    try {
      return decodeJsonPayload(source);
    } catch (error) {}
    return null;
  }

  function concatBytes(parts) {
    const normalized = (parts || [])
      .filter(Boolean)
      .map((part) => (part instanceof Uint8Array ? part : new Uint8Array(part)));
    const totalLength = normalized.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(totalLength);
    let offset = 0;
    normalized.forEach((part) => {
      output.set(part, offset);
      offset += part.length;
    });
    return output;
  }

  function isPngBuffer(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer || 0);
    if (bytes.length < PNG_SIGNATURE.length) return false;
    for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
      if (bytes[index] !== PNG_SIGNATURE[index]) return false;
    }
    return true;
  }

  function readChunkType(view, offset) {
    return String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7)
    );
  }

  function forEachChunk(buffer, callback) {
    if (!isPngBuffer(buffer)) throw new Error('Invalid PNG');
    const view = buffer instanceof DataView ? buffer : new DataView(buffer);
    let offset = PNG_SIGNATURE.length;
    while (offset + 12 <= view.byteLength) {
      const length = view.getUint32(offset);
      const type = readChunkType(view, offset);
      const dataStart = offset + 8;
      const chunkEnd = dataStart + length + 4;
      if (chunkEnd > view.byteLength) throw new Error('Corrupted PNG');
      const state = callback({
        offset,
        length,
        type,
        data: new Uint8Array(view.buffer, view.byteOffset + dataStart, length)
      });
      if (state === false) break;
      offset = chunkEnd;
    }
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let crc = index;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
      }
      table[index] = crc >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) {
      crc = crcTable[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function buildChunk(type, dataBytes) {
    const data = dataBytes instanceof Uint8Array ? dataBytes : new Uint8Array(dataBytes);
    const typeBytes = encodeAscii(type);
    const output = new Uint8Array(data.length + 12);
    const view = new DataView(output.buffer);
    view.setUint32(0, data.length);
    output.set(typeBytes, 4);
    output.set(data, 8);
    view.setUint32(output.length - 4, crc32(concatBytes([typeBytes, data])));
    return output;
  }

  function buildTextChunk(keyword, value) {
    return buildChunk('tEXt', concatBytes([encodeAscii(keyword), new Uint8Array([0]), encodeAscii(value)]));
  }

  function asciiBytesToString(bytes) {
    let text = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      const chunk = bytes.subarray(index, Math.min(bytes.length, index + chunkSize));
      text += String.fromCharCode.apply(null, chunk);
    }
    return text;
  }

  function parseTextChunk(data) {
    const zeroIndex = data.indexOf(0);
    if (zeroIndex < 0) return null;
    return {
      keyword: asciiBytesToString(data.subarray(0, zeroIndex)),
      text: asciiBytesToString(data.subarray(zeroIndex + 1))
    };
  }

  function readPayloads(buffer) {
    const result = { mini: null, chara: null };
    forEachChunk(buffer, ({ type, data }) => {
      if (type !== 'tEXt') return;
      const parsed = parseTextChunk(data);
      if (!parsed) return;
      const payload = tryParseEmbeddedPayload(parsed.text);
      if (payload == null) return;
      if (parsed.keyword === 'mini' && result.mini == null) result.mini = payload;
      if (parsed.keyword === 'chara' && result.chara == null) result.chara = payload;
    });
    return result;
  }

  function embedPayloads(buffer, payloads) {
    if (!isPngBuffer(buffer)) throw new Error('Invalid PNG');
    let iendOffset = -1;
    forEachChunk(buffer, ({ offset, type }) => {
      if (type === 'IEND') {
        iendOffset = offset;
        return false;
      }
      return undefined;
    });
    if (iendOffset < 0) throw new Error('Missing PNG end chunk');
    const textChunks = (payloads || [])
      .filter((payload) => payload && payload.keyword && payload.value != null)
      .map((payload) => buildTextChunk(payload.keyword, encodeJsonPayload(payload.value)));
    if (!textChunks.length) return new Uint8Array(buffer);
    const bytes = new Uint8Array(buffer);
    return concatBytes([bytes.subarray(0, iendOffset), ...textChunks, bytes.subarray(iendOffset)]);
  }

  function dataUrlToBytes(dataUrl) {
    const source = String(dataUrl || '');
    const commaIndex = source.indexOf(',');
    if (commaIndex < 0) throw new Error('Invalid data URL');
    return base64ToBytes(source.slice(commaIndex + 1));
  }

  function bytesToDataUrl(bytes) {
    return `data:image/png;base64,${bytesToBase64(bytes)}`;
  }

  async function readFile(file) {
    if (!file || typeof file.arrayBuffer !== 'function') throw new Error('PNG file is required');
    return readPayloads(await file.arrayBuffer());
  }

  function embedDataUrl(dataUrl, payloads) {
    const bytes = dataUrlToBytes(dataUrl);
    return bytesToDataUrl(embedPayloads(bytes.buffer, payloads));
  }

  function buildTavernCard(data) {
    const source = data && typeof data === 'object' ? data : {};
    return {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: source.nickname || source.name || source.account || 'Unknown',
        description: source.lore || '',
        personality: source.signature || '',
        scenario: '',
        first_mes: '',
        mes_example: '',
        creator_notes: source.signature || '',
        extensions: {
          mini: {
            format: source.type || '',
            account: source.account || '',
            language: source.language || '',
            gender: source.gender || ''
          }
        }
      }
    };
  }

  window.MiniPngCard = {
    buildTavernCard,
    embedDataUrl,
    readFile
  };
})();
