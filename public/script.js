const searchInput = document.getElementById('searchInput');
const dropdown = document.getElementById('dropdown');
const details = document.getElementById('details');
let timeout = null;

searchInput.addEventListener('input', () => {
  clearTimeout(timeout);
  const query = searchInput.value.trim();

  if (query.length === 0) {
    dropdown.innerHTML = '';
    dropdown.style.display = 'none';
    return;
  }

  dropdown.innerHTML = '<div class="dropdown-item">Loading...</div>';
  dropdown.style.display = 'block';

  timeout = setTimeout(() => {
    fetch(`http://localhost:3000/manga?title=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data.result === 'ok' && Array.isArray(data.data)) {
          dropdown.innerHTML = data.data.map(manga => {
            const title = manga.attributes.title.en || 'Unknown Title';
            return `<div class="dropdown-item" data-id="${manga.id}">${title}</div>`;
          }).join('');
        } else {
          dropdown.innerHTML = '<div class="dropdown-item">No results found</div>';
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        dropdown.innerHTML = '<div class="dropdown-item">Error fetching data</div>';
      });
  }, 300);
});

dropdown.addEventListener('click', (e) => {
  const item = e.target.closest('.dropdown-item');
  if (item && item.dataset.id) {
    fetchMangaDetails(item.dataset.id);
    dropdown.style.display = 'none';
  }
});

function fetchMangaDetails(id) {
  fetch(`https://api.mangadex.org/manga/${id}?includes[]=cover_art`)
    .then(res => res.json())
    .then(data => {
      const manga = data.data;
      const attr = manga.attributes;
      const title = attr.title.en || 'Untitled';
      const description = attr.description.en || 'No description available.';
      const tags = attr.tags.map(tag => tag.attributes.name.en).join(', ');
      const rating = attr.rating?.average ? `${attr.rating.average}/10` : 'N/A';

      const coverArt = manga.relationships.find(r => r.type === 'cover_art');
      const coverFileName = coverArt?.attributes?.fileName;
      const coverUrl = coverFileName
        ? `https://uploads.mangadex.org/covers/${id}/${coverFileName}.256.jpg`
        : '';

      details.innerHTML = `
        <h2>${title}</h2>
        <img src="${coverUrl}" alt="${title}" />
        <p><strong>Rating:</strong> ${rating}</p>
        <p><strong>Genres:</strong> ${tags}</p>
        <p>${description}</p>
      `;
      details.style.display = 'block';
    })
    .catch(err => {
      console.error('Details fetch error:', err);
      details.innerHTML = '<p>Error loading manga details</p>';
    });
}
