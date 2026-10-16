import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdvancedSearchUrl,
  extractPlayableStreams,
  sanitizeDescription,
  cleanMovieTitle,
  formatDownloadCount,
  formatFileSize,
  getArchiveThumbnailUrl,
  getArchiveEmbedUrl
} from './archiveLogic.ts';

test('buildAdvancedSearchUrl constructs valid query and fields', () => {
  const url = buildAdvancedSearchUrl({
    query: 'mediatype:movies AND collection:feature_films',
    rows: 15,
    page: 2,
    sort: 'downloads desc'
  });

  assert.ok(url.startsWith('https://archive.org/advancedsearch.php?'));
  assert.ok(url.includes('rows=15'));
  assert.ok(url.includes('page=2'));
  assert.ok(url.includes('sort%5B%5D=downloads+desc') || url.includes('sort[]=downloads+desc'));
  assert.ok(url.includes('output=json'));
});

test('extractPlayableStreams filters and prioritizes MP4 video files', () => {
  const identifier = 'sample_film_1930';
  const rawFiles = [
    { name: 'sample_film_1930.thumbs/thumb1.jpg', format: 'Thumbnail' },
    { name: 'sample_film_1930_meta.xml', format: 'Metadata' },
    { name: 'sample_film_1930_archive.torrent', format: 'Archive Torrent' },
    { name: 'sample_film_1930_512kb.mp4', format: '512Kb MPEG4', size: 100000000 },
    { name: 'sample_film_1930.mp4', format: 'h.264', size: 500000000 },
    { name: 'sample_film_1930.ogv', format: 'Ogg Video', size: 300000000 }
  ];

  const streams = extractPlayableStreams(identifier, rawFiles);
  assert.equal(streams.length, 3);
  // Highest priority is h.264 MP4
  assert.equal(streams[0].name, 'sample_film_1930.mp4');
  assert.equal(streams[0].isPreferred, true);
  assert.equal(streams[0].url, 'https://archive.org/download/sample_film_1930/sample_film_1930.mp4');
});

test('sanitizeDescription strips html tags and decodes entities', () => {
  const raw = '<p>A classic thriller starring <b>Bela Lugosi</b> &amp; friends. <a href="http://imdb.com">IMDb</a></p>';
  const clean = sanitizeDescription(raw);
  assert.equal(clean, 'A classic thriller starring Bela Lugosi & friends. IMDb');

  // Test array descriptions
  const arrayRaw = ['<p>Part 1 of the story.</p>', '<span>Part 2 details.</span>'];
  const arrayClean = sanitizeDescription(arrayRaw);
  assert.equal(arrayClean, 'Part 1 of the story. Part 2 details.');
});

test('cleanMovieTitle formats title and identifier fallbacks', () => {
  assert.equal(cleanMovieTitle('The Fast and the Furious (1955)', 'fast_furious'), 'The Fast and the Furious');
  assert.equal(cleanMovieTitle('', 'House_On_Haunted_Hill'), 'House On Haunted Hill');
});

test('formatDownloadCount formats numbers correctly', () => {
  assert.equal(formatDownloadCount(4500000), '4.5M views');
  assert.equal(formatDownloadCount(12400), '12.4K views');
  assert.equal(formatDownloadCount(850), '850 views');
  assert.equal(formatDownloadCount(0), '0 views');
});

test('formatFileSize formats bytes correctly', () => {
  assert.equal(formatFileSize(1073741824 * 1.5), '1.50 GB');
  assert.equal(formatFileSize(1048576 * 45), '45.0 MB');
});

test('embed and thumbnail URLs are generated properly', () => {
  assert.equal(getArchiveThumbnailUrl('night_living_dead'), 'https://archive.org/services/img/night_living_dead');
  assert.equal(getArchiveEmbedUrl('night_living_dead'), 'https://archive.org/embed/night_living_dead');
});
