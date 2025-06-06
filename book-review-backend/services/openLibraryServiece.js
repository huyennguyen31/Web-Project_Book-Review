async function fetchOpenLibraryDetails(workLink) {
  try {
    const workId = workLink.split('/').pop();
    const url = `https://openlibrary.org/works/${workId}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể truy cập dữ liệu OpenLibrary');
    const data = await res.json();

    return {
      description: typeof data.description === 'string' ? data.description : data.description?.value || '',
      subjects: data.subjects || [],
      covers: data.covers || [],
    };
  } catch (error) {
    console.error('Lỗi crawl OpenLibrary:', error);
    return null;
  }
}

module.exports = { fetchOpenLibraryDetails };